"use client";

import { useEffect, useState, useTransition } from "react";
import { Alert, Button, Chip, Mono, appStyles as a, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";
import { Segmented, Switch } from "@/components/app/controls";
import { useConfirm } from "@/components/ws-confirm";
import { useToast } from "@/components/ws-toast";
import { EVENT_BY_KEY, EVENTS, LOCKED_ON, PROVIDER_META, type EventKey, type Frequency } from "@/lib/integrations/events";
import { relativeTime } from "@/lib/relative-time";
import type { PublicIntegration } from "@/lib/integrations/store";
import { ProviderLogo } from "./provider-logo";
import styles from "./integrations.module.css";

type ProductSlug = "outlier" | "signal" | "workspace";

const GROUP_LABEL = { outlier: "Outlier", signal: "Signal", all: "Account" } as const;

// What stops when a destination is disconnected — said plainly in the
// confirm step.
const DISCONNECT_COPY: Record<PublicIntegration["provider"], string> = {
  slack: "Creos Labs will stop posting to Slack and revoke its access to your workspace. Anything still queued is dropped.",
  email: "Alerts and digests will stop going to these addresses. Anything still queued is dropped.",
  sheets: "Creos Labs will stop adding rows and revoke its access to your Google account. The Sheet and its rows stay in your Drive.",
  notion: "Creos Labs will stop creating pages. Existing pages stay in Notion; remove the integration there to fully revoke access.",
};

async function call(path: string, init?: RequestInit): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch(path, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: "Network error — check your connection and try again." } };
  }
}

function RoutingRow({ item, event, onChanged }: { item: PublicIntegration; event: EventKey; onChanged: () => void }) {
  const toast = useToast();
  const setting = item.routing[event]!;
  const def = EVENT_BY_KEY[event];
  const locked = LOCKED_ON[item.provider]?.includes(event);
  const batchable = (item.provider === "slack" || item.provider === "email") && def.frequencies.length > 1;
  const [enabled, setEnabled] = useState(setting.enabled);
  const [frequency, setFrequency] = useState<Frequency>(setting.frequency);
  const [, startTransition] = useTransition();

  function save(patch: { enabled?: boolean; frequency?: Frequency }, revert: () => void) {
    startTransition(async () => {
      const res = await call(`/api/integrations/${item.provider}`, { method: "PATCH", body: JSON.stringify({ event, ...patch }) });
      if (!res.ok) {
        revert();
        toast(String(res.data.error ?? "Couldn’t save that."), "error");
        return;
      }
      onChanged();
    });
  }

  return (
    <div className={styles.routeRow}>
      <span className={styles.routeName}>{def.label}</span>
      {locked ? (
        <Mono className={styles.routeNote}>Always on</Mono>
      ) : (
        <>
          {!batchable && item.provider !== "slack" && item.provider !== "email" && <Mono className={styles.routeNote}>Per result</Mono>}
          {event === "weekly_digest" && <Mono className={styles.routeNote}>{item.provider === "email" ? "Mondays" : "Weekly"}</Mono>}
          <Switch
            checked={enabled}
            label={`${def.label} to ${PROVIDER_META[item.provider].name}`}
            onChange={(next) => {
              setEnabled(next);
              save({ enabled: next }, () => setEnabled(!next));
            }}
          />
          {batchable && enabled && (
            <div className={styles.routeFreq}>
              <Segmented
                label={`${def.label} frequency`}
                value={frequency}
                options={def.frequencies.map((f) => ({ value: f, label: f === "instant" ? "Instant" : f === "daily" ? "Daily digest" : "Weekly digest" }))}
                onChange={(next) => {
                  const prev = frequency;
                  setFrequency(next);
                  save({ frequency: next }, () => setFrequency(prev));
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmailDestination({ item, onChanged }: { item: PublicIntegration; onChanged: () => void }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const addresses = item.config.addresses ?? [];

  async function add(address: string) {
    setBusy(true);
    const res = await call("/api/integrations/email/addresses", { method: "POST", body: JSON.stringify({ email: address }) });
    setBusy(false);
    if (!res.ok) {
      toast(String(res.data.error ?? "Couldn’t add that address."), "error");
      return;
    }
    setEmail("");
    toast(res.data.alreadyConfirmed ? "That address is already confirmed." : `Confirmation sent to ${address}.`, "success");
    onChanged();
  }

  async function remove(address: string) {
    const res = await call("/api/integrations/email/addresses", { method: "DELETE", body: JSON.stringify({ email: address }) });
    if (!res.ok) toast(String(res.data.error ?? "Couldn’t remove that address."), "error");
    onChanged();
  }

  return (
    <div className={styles.section}>
      <Mono className={styles.sectionLabel}>Destination</Mono>
      {addresses.length > 0 && (
        <div className={styles.group}>
          {addresses.map((addr) => (
            <div key={addr.email} className={styles.addrRow}>
              <span className={styles.addr}>{addr.email}</span>
              {addr.disabled ? (
                <Chip variant="fail">{addr.disabled}</Chip>
              ) : addr.confirmed ? (
                <Chip variant="soft">Confirmed</Chip>
              ) : (
                <>
                  <Chip variant="outline">Pending</Chip>
                  <Button variant="link" onClick={() => add(addr.email)} disabled={busy}>
                    Resend
                  </Button>
                </>
              )}
              <Button variant="linkDanger" onClick={() => remove(addr.email)} aria-label={`Remove ${addr.email}`}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <form
        className={styles.inline}
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) add(email.trim());
        }}
      >
        <input className={a.input} type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
        <Button type="submit" variant="paper" disabled={busy || !email.trim()}>
          {busy ? "Sending…" : "Add address"}
        </Button>
      </form>
      <p className={a.hint}>Each new address gets a confirmation email before anything is sent to it.</p>
    </div>
  );
}

type NotionOptions = { databases: { id: string; name: string }[]; pages: { id: string; name: string }[] };

function NotionDestination({ item, onChanged }: { item: PublicIntegration; onChanged: () => void }) {
  const toast = useToast();
  const [options, setOptions] = useState<NotionOptions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [choice, setChoice] = useState(item.config.databaseId ?? "");
  const [parent, setParent] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    call("/api/integrations/notion/databases").then((res) => {
      if (cancelled) return;
      if (res.ok) setOptions(res.data as unknown as NotionOptions);
      else setLoadError(String(res.data.error ?? "Couldn’t load your Notion databases."));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(body: Record<string, unknown>) {
    setBusy(true);
    const res = await call("/api/integrations/notion/databases", { method: "POST", body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) {
      toast(String(res.data.error ?? "Couldn’t use that database."), "error");
      return;
    }
    toast(`Results will go to ${String(res.data.name ?? "your database")}.`, "success");
    onChanged();
  }

  return (
    <div className={styles.section}>
      <Mono className={styles.sectionLabel}>Destination</Mono>
      {item.config.databaseName && (
        <p className={styles.detail}>
          Pages are created in{" "}
          {item.config.databaseUrl ? (
            <a href={item.config.databaseUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
              {item.config.databaseName}
            </a>
          ) : (
            <b>{item.config.databaseName}</b>
          )}
          .
        </p>
      )}
      {loadError ? (
        <p className={cx(styles.testResult, styles.testFail)}>{loadError}</p>
      ) : !options ? (
        <p className={a.hint}>Loading what you shared with Creos Labs…</p>
      ) : (
        <>
          {options.databases.length > 0 && (
            <div className={styles.inline}>
              <select className={a.input} value={choice} onChange={(e) => setChoice(e.target.value)} aria-label="Notion database">
                <option value="">Choose a database…</option>
                {options.databases.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <Button variant="paper" disabled={!choice || busy || choice === item.config.databaseId} onClick={() => save({ databaseId: choice })}>
                Use database
              </Button>
            </div>
          )}
          {options.pages.length > 0 ? (
            <div className={styles.inline}>
              <select className={a.input} value={parent} onChange={(e) => setParent(e.target.value)} aria-label="Page to create the database in">
                <option value="">Or create one inside a page…</option>
                {options.pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button variant="ghost" disabled={!parent || busy} onClick={() => save({ create: true, parentPageId: parent })}>
                Create database
              </Button>
            </div>
          ) : options.databases.length === 0 ? (
            <p className={a.hint}>Nothing is shared with Creos Labs yet. Reconnect and tick a page or database on Notion’s approve screen.</p>
          ) : null}
        </>
      )}
      <p className={a.hint}>Creos Labs only sees the pages you grant on Notion’s approve screen. Each result becomes one page with product, score, date and link.</p>
    </div>
  );
}

export function ManagePanel({
  item,
  product,
  hasLogo,
  onClose,
  onChanged,
  onDisconnected,
}: {
  item: PublicIntegration;
  product: ProductSlug;
  hasLogo: boolean;
  onClose: () => void;
  onChanged: () => void;
  onDisconnected: () => void;
}) {
  const confirm = useConfirm();
  const toast = useToast();
  const meta = PROVIDER_META[item.provider];
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; message: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function sendTest() {
    setTesting(true);
    setTest(null);
    const res = await call(`/api/integrations/${item.provider}/test`, { method: "POST" });
    setTesting(false);
    setTest(res.ok ? { ok: true, message: `Sent. Check ${item.provider === "sheets" ? "your Sheet" : item.provider === "notion" ? "your Notion database" : item.provider === "email" ? "your inbox" : item.label?.split(" · ")[1] ?? "Slack"} for the sample.` } : { ok: false, message: String(res.data.error ?? "The test message failed.") });
    onChanged();
  }

  async function disconnect() {
    const ok = await confirm({ title: `Disconnect ${meta.name}?`, description: DISCONNECT_COPY[item.provider], confirmLabel: "Disconnect", danger: true });
    if (!ok) return;
    setRemoving(true);
    const res = await call(`/api/integrations/${item.provider}`, { method: "DELETE" });
    setRemoving(false);
    if (!res.ok) {
      toast(String(res.data.error ?? "Couldn’t disconnect."), "error");
      return;
    }
    toast(`${meta.name} disconnected.`, "success");
    onDisconnected();
  }

  const events = EVENTS.filter((e) => item.routing[e.key]);
  const groups = (["outlier", "signal", "all"] as const).map((g) => ({ key: g, events: events.filter((e) => e.product === g) })).filter((g) => g.events.length > 0);
  const reconnectHref = `/api/integrations/${item.provider}/connect?product=${product}`;
  const canTest = item.state !== "attention" && !(item.provider === "notion" && item.needsSetup);

  return (
    <div className={styles.scrim} onClick={onClose}>
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={`Manage ${meta.name}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHead}>
          <ProviderLogo provider={item.provider} hasFile={hasLogo} size={40} />
          <h2 className={styles.drawerTitle}>{meta.name}</h2>
          <button type="button" className={a.iconBtn} style={{ width: 32, height: 32 }} onClick={onClose} aria-label="Close">
            <Icon name="close" size={14} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {item.state === "attention" && item.provider !== "email" && (
            <Alert title="Reconnect required" compact actions={<Button variant="primary" size="sm" href={reconnectHref}>Reconnect</Button>}>
              The connection was revoked or expired, so nothing is being delivered.
            </Alert>
          )}
          {item.state === "error" && item.lastDelivery && (
            <Alert title="Last delivery failed" compact>
              {relativeTime(item.lastDelivery.at)} · {item.lastDelivery.error ?? "Delivery failed."}
            </Alert>
          )}

          {item.provider === "slack" && (
            <div className={styles.section}>
              <Mono className={styles.sectionLabel}>Destination</Mono>
              <p className={styles.detail}>Posting to <b>{item.label}</b></p>
              <p className={a.hint}>To post somewhere else, reconnect and pick another channel on Slack’s approve screen.</p>
              <div>
                <Button variant="ghost" size="sm" href={reconnectHref}>
                  Change channel
                </Button>
              </div>
            </div>
          )}
          {item.provider === "email" && <EmailDestination item={item} onChanged={onChanged} />}
          {item.provider === "sheets" && (
            <div className={styles.section}>
              <Mono className={styles.sectionLabel}>Destination</Mono>
              <p className={styles.detail}>Adding one row per result to <b>{item.config.sheetName ?? "your Sheet"}</b>.</p>
              {item.config.sheetUrl && (
                <div>
                  <Button variant="ghost" size="sm" icon="external" href={item.config.sheetUrl} external>
                    Open the Sheet
                  </Button>
                </div>
              )}
              <p className={a.hint}>Columns: date, product, item, score or multiple, link. Creos Labs can only see files it created.</p>
            </div>
          )}
          {item.provider === "notion" && <NotionDestination item={item} onChanged={onChanged} />}

          <div className={styles.section}>
            <Mono className={styles.sectionLabel}>Routing</Mono>
            {/* Remounts when the saved routing changes so switches reflect the server. */}
            <div key={JSON.stringify(item.routing)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {groups.map((g) => (
                <div key={g.key} className={styles.group}>
                  <Mono className={styles.groupLabel}>{GROUP_LABEL[g.key]}</Mono>
                  {g.events.map((e) => (
                    <RoutingRow key={e.key} item={item} event={e.key} onChanged={onChanged} />
                  ))}
                </div>
              ))}
            </div>
            {(item.provider === "slack" || item.provider === "email") && <p className={a.hint}>Digests send at 14:00 UTC, weekly ones on Mondays.</p>}
          </div>

          {canTest && (
            <div className={styles.section}>
              <Mono className={styles.sectionLabel}>Test</Mono>
              <div>
                <Button variant="paper" onClick={sendTest} disabled={testing}>
                  {testing ? "Sending…" : "Send test message"}
                </Button>
              </div>
              {test && (
                <p className={cx(styles.testResult, test.ok ? styles.testOk : styles.testFail)} role="status">
                  {test.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className={styles.drawerFoot}>
          <Button variant="linkDanger" onClick={disconnect} disabled={removing}>
            {removing ? "Disconnecting…" : "Disconnect"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </aside>
    </div>
  );
}
