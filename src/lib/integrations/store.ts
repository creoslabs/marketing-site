import { createAdminClient } from "@/lib/supabase/admin";
import { decryptJson, encryptJson } from "./crypto";
import { resolveRouting, PROVIDERS, type EventKey, type Provider, type RouteSetting } from "./events";
import { revokeSlack } from "./adapters/slack";
import { revokeGoogle } from "./adapters/sheets";
import type { ConnectionConfig, IntegrationRow, ProviderSecrets } from "./types";

// All reads and writes go through the service-role client in server-only
// code. The tables have no RLS policies, so nothing here is reachable from
// the browser, and secrets are stripped before anything is returned to a
// page or an API response.

export type CardState = "not_connected" | "connected" | "attention" | "error";

export type PublicIntegration = {
  provider: Provider;
  state: CardState;
  label: string | null;
  config: ConnectionConfig;
  routing: Partial<Record<EventKey, RouteSetting>>;
  lastDelivery: { status: "sent" | "failed"; at: string; error: string | null; event: string } | null;
  // Notion: connected, but no database chosen yet.
  needsSetup: boolean;
};

export async function getRow(userId: string, provider: Provider): Promise<IntegrationRow | null> {
  const admin = createAdminClient();
  const { data } = await admin.from("integrations").select("*").eq("user_id", userId).eq("provider", provider).maybeSingle();
  return (data as IntegrationRow | null) ?? null;
}

export function readSecrets(row: IntegrationRow): ProviderSecrets {
  if (!row.secrets_encrypted) return {};
  try {
    return decryptJson<ProviderSecrets>(row.secrets_encrypted);
  } catch {
    return {};
  }
}

export async function listIntegrations(userId: string): Promise<PublicIntegration[]> {
  const admin = createAdminClient();
  const [{ data: rows }, { data: deliveries }] = await Promise.all([
    admin.from("integrations").select("id, provider, status, label, config, routing").eq("user_id", userId),
    admin
      .from("integration_deliveries")
      .select("integration_id, status, error, event, created_at, sent_at")
      .eq("user_id", userId)
      .in("status", ["sent", "failed"])
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const lastById = new Map<string, PublicIntegration["lastDelivery"]>();
  for (const d of deliveries ?? []) {
    if (lastById.has(d.integration_id as string)) continue;
    lastById.set(d.integration_id as string, {
      status: d.status as "sent" | "failed",
      at: (d.sent_at ?? d.created_at) as string,
      error: (d.error as string | null) ?? null,
      event: d.event as string,
    });
  }

  return PROVIDERS.map((provider) => {
    const row = (rows ?? []).find((r) => r.provider === provider) as (Pick<IntegrationRow, "provider" | "status" | "label" | "config" | "routing"> & { id: string }) | undefined;
    if (!row) return { provider, state: "not_connected", label: null, config: {}, routing: resolveRouting(provider, null), lastDelivery: null, needsSetup: false };
    const lastDelivery = lastById.get(row.id) ?? null;
    const state: CardState = row.status === "attention" ? "attention" : lastDelivery?.status === "failed" ? "error" : "connected";
    return {
      provider,
      state,
      label: row.label,
      config: row.config ?? {},
      routing: resolveRouting(provider, row.routing),
      lastDelivery,
      needsSetup: provider === "notion" && !row.config?.databaseId,
    };
  });
}

// For the dot on the Settings nav. Never throws — a layout must not fail
// because integrations aren't configured.
export async function countAttention(userId: string): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count } = await admin.from("integrations").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "attention");
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function saveConnection(input: {
  userId: string;
  provider: Provider;
  label: string | null;
  config: ConnectionConfig;
  secrets?: ProviderSecrets;
}): Promise<IntegrationRow> {
  const admin = createAdminClient();
  const existing = await getRow(input.userId, input.provider);
  const payload = {
    user_id: input.userId,
    provider: input.provider,
    status: "connected" as const,
    label: input.label,
    // Reconnecting keeps routing choices, and for providers where the user
    // already picked a destination (Notion database) that choice survives.
    config: { ...(existing?.config ?? {}), ...input.config },
    routing: existing?.routing ?? {},
    secrets_encrypted: input.secrets ? encryptJson(input.secrets) : (existing?.secrets_encrypted ?? null),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await admin.from("integrations").upsert(payload, { onConflict: "user_id,provider" }).select("*").single();
  if (error) throw new Error(error.message);
  return data as IntegrationRow;
}

export async function updateRow(id: string, patch: Partial<Pick<IntegrationRow, "status" | "label" | "config" | "routing">>) {
  const admin = createAdminClient();
  await admin
    .from("integrations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function markAttention(id: string) {
  await updateRow(id, { status: "attention" });
}

export async function setRouting(row: IntegrationRow, provider: Provider, event: EventKey, setting: Partial<RouteSetting>) {
  const current = resolveRouting(provider, row.routing)[event];
  if (!current) throw new Error("That event isn't available for this destination.");
  const next = { ...row.routing, [event]: { ...(row.routing[event] ?? {}), ...current, ...setting } };
  await updateRow(row.id, { routing: next });
}

// Revokes the token with the provider where an API exists, deletes it from
// storage, and — because deliveries cascade with the integration — stops
// everything still queued.
export async function disconnect(userId: string, provider: Provider) {
  const row = await getRow(userId, provider);
  if (!row) return;
  const secrets = readSecrets(row);
  if (provider === "slack") await revokeSlack(secrets.slackBotToken);
  if (provider === "sheets") await revokeGoogle(secrets.googleRefreshToken);
  const admin = createAdminClient();
  await admin.from("integrations").delete().eq("id", row.id);
}

export async function activeRowsForUser(userId: string): Promise<IntegrationRow[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("integrations").select("*").eq("user_id", userId).eq("status", "connected");
  return (data ?? []) as IntegrationRow[];
}
