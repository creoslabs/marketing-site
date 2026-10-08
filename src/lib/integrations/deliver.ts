import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT_BY_KEY, PROVIDER_META, resolveRouting, type EventKey, type Frequency, type Provider } from "./events";
import { integrationsLink } from "./links";
import { activeRowsForUser, markAttention, readSecrets, updateRow } from "./store";
import { slackAdapter } from "./adapters/slack";
import { emailAdapter } from "./adapters/email";
import { sheetsAdapter } from "./adapters/sheets";
import { notionAdapter } from "./adapters/notion";
import { sampleTestPayload } from "./messages";
import { nextWindow } from "./schedule";
import { ReconnectRequiredError, type Adapter, type DeliveryPayload, type IntegrationRow } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this project doesn't generate a Database type for the Supabase client.
type Admin = SupabaseClient<any>;

const ADAPTERS: Record<Provider, Adapter> = { slack: slackAdapter, email: emailAdapter, sheets: sheetsAdapter, notion: notionAdapter };

const MAX_ATTEMPTS = 3;
// Backoff before attempt 2 and attempt 3.
const BACKOFF_MS = [60_000, 5 * 60_000];
const CLAIM_MS = 5 * 60_000;
// Slack allows roughly one message a second per channel.
const SLACK_GAP_MS = 1100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const nowMs = () => Date.now();

function canReceive(row: IntegrationRow): boolean {
  if (row.provider === "email") return (row.config.addresses ?? []).some((a) => a.confirmed && !a.disabled);
  if (row.provider === "sheets") return Boolean(row.config.sheetId);
  if (row.provider === "notion") return Boolean(row.config.databaseId);
  return true;
}

// Products emit events; this routes each to every destination the user has
// switched on for it and queues one delivery per destination. Sending
// happens in processDue() (kicked off straight away by callers via after(),
// and by the daily cron as the retry and digest safety net).
export async function emit(userId: string, event: EventKey, payload: DeliveryPayload, opts?: { only?: Provider[] }): Promise<number> {
  const admin = createAdminClient();
  const rows = await activeRowsForUser(userId);
  const inserts: Record<string, unknown>[] = [];
  const now = new Date();

  for (const row of rows) {
    if (opts?.only && !opts.only.includes(row.provider)) continue;
    const setting = resolveRouting(row.provider, row.routing)[event];
    if (!setting?.enabled || !canReceive(row)) continue;

    // Only chat and email destinations batch into digests; Sheets and Notion
    // always get one row/page per result as it happens.
    const batchable = (row.provider === "slack" || row.provider === "email") && EVENT_BY_KEY[event].frequencies.length > 1;
    const frequency: Frequency = batchable ? setting.frequency : "instant";
    inserts.push({
      user_id: userId,
      integration_id: row.id,
      provider: row.provider,
      event,
      status: "queued",
      payload,
      digest: frequency !== "instant",
      next_attempt_at: frequency === "instant" ? now.toISOString() : nextWindow(frequency, now).toISOString(),
    });
  }

  if (inserts.length === 0) return 0;
  const { error } = await admin.from("integration_deliveries").insert(inserts);
  if (error) throw new Error(error.message);
  return inserts.length;
}

type DeliveryRow = {
  id: string;
  user_id: string;
  integration_id: string;
  provider: Provider;
  event: string;
  status: "queued" | "sending";
  attempts: number;
  next_attempt_at: string;
  payload: DeliveryPayload;
  digest: boolean;
};

function combineDigest(rows: DeliveryRow[]): DeliveryPayload {
  const first = rows[0].payload;
  if (rows.length === 1) return first;
  const items = rows.flatMap((r) => r.payload.items ?? [{ headline: r.payload.headline, detail: r.payload.lines[0], href: r.payload.href, thumbnailUrl: r.payload.thumbnailUrl }]);
  const scope = rows[0].event === "outlier_detected" ? "outliers" : "scorecards";
  return {
    ...first,
    title: `${EVENT_BY_KEY[rows[0].event as EventKey]?.label ?? first.title} digest`,
    headline: `${rows.length} ${scope} since your last digest`,
    lines: [],
    thumbnailUrl: null,
    items,
    row: { ...first.row, item: `${rows.length} ${scope}`, score: rows.length },
  };
}

export type ProcessResult = { claimed: number; sent: number; failed: number; retrying: number };

// Picks up everything due, sends it, and records the outcome. Retries up to
// three attempts with backoff, then marks the delivery failed. A revoked or
// expired token skips retries and flips the card to "Reconnect required".
export async function processDue(limit = 40): Promise<ProcessResult> {
  const admin = createAdminClient();
  const result: ProcessResult = { claimed: 0, sent: 0, failed: 0, retrying: 0 };
  const nowIso = new Date().toISOString();

  const { data: due } = await admin
    .from("integration_deliveries")
    .select("*")
    .in("status", ["queued", "sending"])
    .lte("next_attempt_at", nowIso)
    .order("created_at", { ascending: true })
    .limit(limit);

  // Claim with a compare-and-set so overlapping workers don't double-send.
  const claimed: DeliveryRow[] = [];
  for (const d of (due ?? []) as DeliveryRow[]) {
    const { data } = await admin
      .from("integration_deliveries")
      .update({ status: "sending", attempts: d.attempts + 1, next_attempt_at: new Date(nowMs() + CLAIM_MS).toISOString() })
      .eq("id", d.id)
      .eq("status", d.status)
      .eq("next_attempt_at", d.next_attempt_at)
      .select("id")
      .maybeSingle();
    if (data) claimed.push({ ...d, status: "sending", attempts: d.attempts + 1 });
  }
  result.claimed = claimed.length;
  if (claimed.length === 0) return result;

  // Group digest rows so a daily/weekly destination gets one message.
  const groups = new Map<string, DeliveryRow[]>();
  for (const d of claimed) {
    const key = d.digest ? `${d.integration_id}:${d.event}` : d.id;
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }

  const integrationCache = new Map<string, IntegrationRow | null>();
  const lastSlackSend = new Map<string, number>();

  for (const group of groups.values()) {
    const first = group[0];
    let row = integrationCache.get(first.integration_id);
    if (row === undefined) {
      const { data } = await admin.from("integrations").select("*").eq("id", first.integration_id).maybeSingle();
      row = (data as IntegrationRow | null) ?? null;
      integrationCache.set(first.integration_id, row);
    }
    if (!row) {
      await finish(admin, group, "failed", "Disconnected before this was sent.");
      result.failed += group.length;
      continue;
    }
    if (row.status === "attention") {
      await finish(admin, group, "failed", "Reconnect required");
      result.failed += group.length;
      continue;
    }

    if (row.provider === "slack") {
      const wait = SLACK_GAP_MS - (nowMs() - (lastSlackSend.get(row.id) ?? 0));
      if (wait > 0 && lastSlackSend.has(row.id)) await sleep(wait);
    }

    try {
      await ADAPTERS[row.provider].send({ integration: row, secrets: readSecrets(row) }, group.length > 1 || first.digest ? combineDigest(group) : first.payload);
      if (row.provider === "slack") lastSlackSend.set(row.id, nowMs());
      await afterSend(row);
      await finish(admin, group, "sent", null);
      result.sent += group.length;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delivery failed.";
      if (row.provider === "slack") lastSlackSend.set(row.id, nowMs());
      if (err instanceof ReconnectRequiredError) {
        await markAttention(row.id);
        row.status = "attention";
        await finish(admin, group, "failed", "Reconnect required");
        await reportProblem(admin, row, "Reconnect required — your token was revoked or expired.");
        result.failed += group.length;
      } else if (first.attempts >= MAX_ATTEMPTS) {
        await finish(admin, group, "failed", message);
        await reportProblem(admin, row, message);
        result.failed += group.length;
      } else {
        const delay = BACKOFF_MS[first.attempts - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
        await admin
          .from("integration_deliveries")
          .update({ status: "queued", error: message, next_attempt_at: new Date(nowMs() + delay).toISOString() })
          .in("id", group.map((g) => g.id));
        result.retrying += group.length;
      }
    }
  }
  return result;
}

async function finish(admin: Admin, group: DeliveryRow[], status: "sent" | "failed", error: string | null) {
  await admin
    .from("integration_deliveries")
    .update({ status, error, sent_at: status === "sent" ? new Date().toISOString() : null })
    .in("id", group.map((g) => g.id));
}

// Bookkeeping that only a successful send can confirm.
async function afterSend(row: IntegrationRow) {
  if (row.provider === "sheets" && !row.config.headerWritten) {
    row.config = { ...row.config, headerWritten: true };
    await updateRow(row.id, { config: row.config });
  }
}

// Tell the user a destination broke — in-app always, and by email when an
// email destination is available and isn't itself the one that failed.
// Throttled to one alert per destination per day.
async function reportProblem(admin: Admin, row: IntegrationRow, reason: string) {
  const name = PROVIDER_META[row.provider].name;
  const since = new Date(nowMs() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("integration_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", row.user_id)
    .eq("event", "delivery_problem")
    .gte("created_at", since)
    .contains("payload", { row: { item: `${name} delivery problem` } });
  if ((count ?? 0) > 0) return;

  await admin.from("notifications").insert({
    user_id: row.user_id,
    title: `${name} delivery problem`,
    body: reason,
    href: "/workspace/integrations",
  });

  if (row.provider === "email") return;
  const link = integrationsLink("workspace");
  const fix = reason.startsWith("Reconnect") ? `Reconnect ${name} in Settings → Integrations to keep results flowing.` : `Open ${name} in Settings → Integrations to see what went wrong.`;
  await emit(
    row.user_id,
    "delivery_problem",
    {
      event: "delivery_problem",
      product: "creos",
      title: "Delivery problem",
      headline: `${name} delivery failed`,
      lines: [reason, fix],
      href: link,
      ctaLabel: "Fix in Integrations",
      row: { date: new Date().toISOString().slice(0, 10), product: "Creos Labs", item: `${name} delivery problem`, score: null, link },
    },
    { only: ["email"] }
  ).catch(() => {});
}

// "Send test message": posts a sample straight through the adapter (not the
// queue) and reports success or the error inline. Logged like any delivery.
export async function sendTest(row: IntegrationRow): Promise<{ ok: true } | { ok: false; error: string; reconnect?: boolean }> {
  const admin = createAdminClient();
  const payload = sampleTestPayload();
  let outcome: { ok: true } | { ok: false; error: string; reconnect?: boolean };
  try {
    await ADAPTERS[row.provider].send({ integration: row, secrets: readSecrets(row) }, payload);
    await afterSend(row);
    outcome = { ok: true };
  } catch (err) {
    if (err instanceof ReconnectRequiredError) {
      await markAttention(row.id);
      outcome = { ok: false, error: "Reconnect required — the connection was revoked or expired.", reconnect: true };
    } else {
      outcome = { ok: false, error: err instanceof Error ? err.message : "The test message failed." };
    }
  }
  await admin.from("integration_deliveries").insert({
    user_id: row.user_id,
    integration_id: row.id,
    provider: row.provider,
    event: "test",
    status: outcome.ok ? "sent" : "failed",
    attempts: 1,
    payload,
    error: outcome.ok ? null : outcome.error,
    sent_at: outcome.ok ? new Date().toISOString() : null,
  });
  return outcome;
}

// Direct send of one specific result to one destination ("Send to…" menu).
export async function sendNow(row: IntegrationRow, payload: DeliveryPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  let outcome: { ok: true } | { ok: false; error: string };
  try {
    await ADAPTERS[row.provider].send({ integration: row, secrets: readSecrets(row) }, payload);
    await afterSend(row);
    outcome = { ok: true };
  } catch (err) {
    if (err instanceof ReconnectRequiredError) await markAttention(row.id);
    outcome = { ok: false, error: err instanceof ReconnectRequiredError ? "Reconnect required — reconnect this destination in Integrations." : err instanceof Error ? err.message : "Couldn't send." };
  }
  await admin.from("integration_deliveries").insert({
    user_id: row.user_id,
    integration_id: row.id,
    provider: row.provider,
    event: payload.event,
    status: outcome.ok ? "sent" : "failed",
    attempts: 1,
    payload,
    error: outcome.ok ? null : outcome.error,
    sent_at: outcome.ok ? new Date().toISOString() : null,
  });
  return outcome;
}

// Sends what was just queued without waiting for the next cron tick. Only
// works inside a request scope (route handlers); anywhere else the
// daily cron picks the rows up.
export function kickDelivery(after: (fn: () => Promise<unknown>) => void) {
  try {
    after(() => processDue().catch(() => {}));
  } catch {
    // Outside a request scope — the cron will handle it.
  }
}

// Convenience used by the product hooks: build a message and queue it for
// every destination switched on for the event. Never throws — integrations
// must not be able to break an analysis or a pull.
export async function emitSafe(userId: string, event: EventKey, build: () => Promise<DeliveryPayload | null>): Promise<number> {
  try {
    const payload = await build();
    if (!payload) return 0;
    return await emit(userId, event, payload);
  } catch {
    return 0;
  }
}
