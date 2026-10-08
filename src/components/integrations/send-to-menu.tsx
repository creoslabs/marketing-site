"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/app/icons";
import { appStyles as s, cx } from "@/components/app/ui";
import { useToast } from "@/components/ws-toast";
import { PROVIDER_META, type Provider } from "@/lib/integrations/events";

type Destination = { provider: Provider; label: string | null };

// "Send to…" on a result or scorecard: lists connected destinations plus
// Export CSV. Destinations load the first time the menu opens.
export function SendToMenu({
  kind,
  id,
  product,
  size = "md",
}: {
  kind: "signal" | "outlier";
  id: string;
  product: "outlier" | "signal";
  size?: "md" | "sm";
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [sending, setSending] = useState<Provider | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && destinations === null) {
      try {
        const res = await fetch("/api/integrations/destinations");
        const data = (await res.json()) as { destinations?: Destination[] };
        setDestinations(data.destinations ?? []);
      } catch {
        setDestinations([]);
      }
    }
  }

  async function send(provider: Provider) {
    setSending(provider);
    try {
      const res = await fetch("/api/integrations/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider, kind, id }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) toast(`Sent to ${PROVIDER_META[provider].name}.`, "success");
      else toast(data.error ?? `Couldn’t send to ${PROVIDER_META[provider].name}.`, "error");
    } catch {
      toast("Network error — try again.", "error");
    }
    setSending(null);
    setOpen(false);
  }

  const csvHref = kind === "signal" ? `/api/integrations/export?kind=signal-asset&id=${id}` : "/api/integrations/export?kind=outlier-feed";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" className={cx(s.btn, size === "sm" && s.btnSm, s.btnGhost)} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
        <span>Send to…</span>
        <Icon name="chevronDown" />
      </button>
      {open && (
        <div className={s.menu} role="menu" style={{ minWidth: 250 }}>
          <p className={cx(s.mono, s.menuLabel)}>Send to</p>
          {destinations === null ? (
            <p className={s.menuEmail}>Loading…</p>
          ) : destinations.length === 0 ? (
            <Link href={`/${product}/integrations`} role="menuitem" className={s.menuItem} onClick={() => setOpen(false)}>
              Connect a destination →
            </Link>
          ) : (
            destinations.map((d) => (
              <button key={d.provider} type="button" role="menuitem" className={s.menuItem} disabled={sending !== null} onClick={() => send(d.provider)}>
                <span>{sending === d.provider ? "Sending…" : PROVIDER_META[d.provider].name}</span>
                {d.label && d.provider !== "email" && <span style={{ color: "var(--ws-ink-45)", fontSize: 11, textTransform: "none", letterSpacing: 0 }}>{d.label.split(" · ").pop()}</span>}
              </button>
            ))
          )}
          <div className={s.menuRule} />
          <a href={csvHref} role="menuitem" className={s.menuItem} onClick={() => setOpen(false)}>
            Export CSV
          </a>
        </div>
      )}
    </div>
  );
}
