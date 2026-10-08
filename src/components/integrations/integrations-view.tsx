"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Mono, cx } from "@/components/app/ui";
import { Modal } from "@/components/app/modal";
import { appStyles as a } from "@/components/app/ui";
import { useToast } from "@/components/ws-toast";
import { PROVIDER_META, PROVIDERS, type Provider } from "@/lib/integrations/events";
import { relativeTime } from "@/lib/relative-time";
import type { PublicIntegration } from "@/lib/integrations/store";
import { ProviderLogo } from "./provider-logo";
import { ManagePanel } from "./manage-panel";
import styles from "./integrations.module.css";

export type Flash = { connected?: string; error?: string; provider?: string; setup?: boolean };
export type ProductSlug = "outlier" | "signal" | "workspace";

function connectHref(provider: Provider, product: ProductSlug, name?: string) {
  const params = new URLSearchParams({ product });
  if (name) params.set("name", name);
  return `/api/integrations/${provider}/connect?${params.toString()}`;
}

function emailPending(i: PublicIntegration) {
  return i.provider === "email" && i.state !== "not_connected" && !(i.config.addresses ?? []).some((x) => x.confirmed && !x.disabled);
}

function statusLabel(i: PublicIntegration): { text: string; warn: boolean } | null {
  if (i.state === "not_connected") return null;
  if (i.state === "attention") return { text: "Reconnect required", warn: true };
  if (i.state === "error") return { text: "Last delivery failed", warn: true };
  if (emailPending(i)) return { text: "Waiting for confirmation", warn: false };
  if (i.needsSetup) return { text: "Pick a database", warn: false };
  const confirmed = (i.config.addresses ?? []).filter((x) => x.confirmed && !x.disabled).length;
  const where = i.provider === "email" ? `${confirmed} address${confirmed === 1 ? "" : "es"}` : i.label;
  return { text: `Connected to ${where ?? PROVIDER_META[i.provider].name}`, warn: false };
}

function extraLine(i: PublicIntegration): { text: string; warn: boolean } {
  if (i.state === "not_connected") return { text: PROVIDER_META[i.provider].blurb, warn: false };
  if (i.state === "error" && i.lastDelivery) return { text: `${relativeTime(i.lastDelivery.at)} · ${i.lastDelivery.error ?? "Delivery failed."}`, warn: true };
  if (i.state === "attention") return { text: "The connection was revoked or expired. Reconnect to keep results flowing.", warn: true };
  if (i.provider === "slack") return { text: i.config.channel ?? PROVIDER_META.slack.blurb, warn: false };
  if (i.provider === "sheets") return { text: i.config.sheetName ?? "Google Sheet", warn: false };
  if (i.provider === "notion") return { text: i.config.databaseName ? `Database: ${i.config.databaseName}` : "Choose where pages are created.", warn: false };
  const bad = (i.config.addresses ?? []).find((x) => x.disabled);
  if (bad) return { text: `${bad.email} is switched off — ${bad.disabled?.toLowerCase()}.`, warn: true };
  return { text: (i.config.addresses ?? []).map((x) => x.email).join(", ") || PROVIDER_META.email.blurb, warn: false };
}

export function IntegrationsView({
  integrations,
  product,
  available,
  logos,
  flash,
  loadError,
}: {
  integrations: PublicIntegration[];
  product: ProductSlug;
  available: Record<Provider, boolean>;
  logos: Record<Provider, boolean>;
  flash: Flash;
  loadError?: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<Provider | null>(flash.setup && flash.connected === "notion" ? "notion" : flash.connected === "email" ? "email" : null);
  const [sheetModal, setSheetModal] = useState(false);
  const [sheetName, setSheetName] = useState("Creos Labs results");
  const flashed = useRef(false);
  const error = flash.error ?? null;

  // Announce the OAuth round trip once, then clear the query so a refresh
  // doesn't repeat it.
  useEffect(() => {
    if (flashed.current) return;
    flashed.current = true;
    if (flash.connected) {
      const name = PROVIDER_META[flash.connected as Provider]?.name ?? "Integration";
      toast(flash.connected === "notion" && flash.setup ? "Notion connected. Pick a database for your results." : flash.connected === "email" ? "Address confirmed." : `${name} connected. Send a test message?`, "success");
    }
    if (flash.connected || flash.error) router.replace(window.location.pathname, { scroll: false });
  }, [flash, router, toast]);

  const byProvider = new Map(integrations.map((i) => [i.provider, i]));
  const current = open ? byProvider.get(open) : null;

  function primary(i: PublicIntegration) {
    const meta = PROVIDER_META[i.provider];
    if (!available[i.provider]) return <Button variant="ghost" disabled>Unavailable</Button>;
    if (i.state === "not_connected") {
      if (i.provider === "email") return <Button variant="primary" onClick={() => setOpen("email")}>Connect</Button>;
      if (i.provider === "sheets") return <Button variant="primary" onClick={() => setSheetModal(true)}>Connect</Button>;
      return <Button variant="primary" href={connectHref(i.provider, product)}>Connect</Button>;
    }
    if (i.state === "attention") {
      return i.provider === "email" ? (
        <Button variant="primary" onClick={() => setOpen("email")}>Reconnect</Button>
      ) : (
        <Button variant="primary" href={connectHref(i.provider, product)}>Reconnect</Button>
      );
    }
    if (i.state === "error") return <Button variant="paper" onClick={() => setOpen(i.provider)}>View details</Button>;
    return (
      <Button variant="ghost" onClick={() => setOpen(i.provider)} aria-label={`Manage ${meta.name}`}>
        Manage
      </Button>
    );
  }

  return (
    <>
      {error && (
        <div style={{ marginBottom: 18 }}>
          <Alert title={flash.provider ? `Couldn’t connect ${PROVIDER_META[flash.provider as Provider]?.name ?? "that integration"}` : "Couldn’t connect"} compact>
            {error}
          </Alert>
        </div>
      )}
      {loadError && (
        <div style={{ marginBottom: 18 }}>
          <Alert title="Integrations aren’t set up on this server yet" compact>
            {loadError}
          </Alert>
        </div>
      )}

      <div className={styles.grid}>
        {PROVIDERS.map((provider) => {
          const i = byProvider.get(provider)!;
          const label = statusLabel(i);
          const extra = extraLine(i);
          return (
            <article key={provider} id={`integration-${provider}`} className={cx(styles.card, (i.state === "attention" || i.state === "error") && styles.cardAttention)} aria-label={PROVIDER_META[provider].name}>
              <div className={styles.cardTop}>
                <ProviderLogo provider={provider} hasFile={logos[provider]} />
                <h2 className={styles.name}>{PROVIDER_META[provider].name}</h2>
                {label && (
                  <Mono className={styles.status}>
                    <span className={cx(styles.dot, label.warn && styles.dotWarn)} aria-hidden="true" />
                    {label.text}
                  </Mono>
                )}
              </div>
              <p className={cx(styles.desc, extra.warn && styles.detailWarn)}>{i.state === "not_connected" ? PROVIDER_META[provider].blurb : extra.text}</p>
              <div className={styles.cardFoot}>{primary(i)}</div>
            </article>
          );
        })}
      </div>

      <div className={styles.exportRow}>
        <div className={styles.exportText}>
          <b>Export</b>
          <span>Download any list or scorecard as CSV. It needs no connection.</span>
        </div>
        <Button variant="ghost" size="sm" icon="download" href="/api/integrations/export?kind=signal-library">
          Signal library
        </Button>
        <Button variant="ghost" size="sm" icon="download" href="/api/integrations/export?kind=outlier-feed">
          Outlier feed
        </Button>
      </div>

      <p className={styles.note}>
        Integrations only send results out. None of them read from or connect to your Instagram, TikTok, Meta or YouTube accounts.
      </p>

      {current && open && (
        <ManagePanel
          key={open}
          item={current}
          product={product}
          hasLogo={logos[open]}
          onClose={() => setOpen(null)}
          onChanged={() => router.refresh()}
          onDisconnected={() => {
            setOpen(null);
            router.refresh();
          }}
        />
      )}

      {sheetModal && (
        <Modal
          title="Connect Google Sheets"
          onClose={() => setSheetModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setSheetModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" icon="arrowRight" href={connectHref("sheets", product, sheetName.trim() || "Creos Labs results")}>
                Continue to Google
              </Button>
            </>
          }
        >
          <p className={a.hint} style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>
            We’ll create a new Sheet in your Google Drive and add one row per result. Creos Labs can only see files it creates, nothing else in your Drive.
          </p>
          <div>
            <label className={cx(a.mono, a.fieldLabel)} htmlFor="sheet-name">
              Sheet name
            </label>
            <input id="sheet-name" className={a.input} style={{ width: "100%", boxSizing: "border-box" }} value={sheetName} onChange={(e) => setSheetName(e.target.value)} maxLength={80} />
          </div>
        </Modal>
      )}
    </>
  );
}
