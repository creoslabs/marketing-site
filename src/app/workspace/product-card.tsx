import type { ReactNode } from "react";
import Link from "next/link";

export type ProductCardStatus = { label: string; color: string } | null;

// The shared shell every product card uses — icon, name, live/processing
// status, a thin accent line for subtle per-product identity, and a footer
// row for the primary action + "Open". The middle is just `children`, so a
// future product's card can look however its own data calls for without
// touching this file.
export function ProductCardFrame({
  icon,
  name,
  eyebrow,
  accentColor,
  status,
  openHref,
  primaryAction,
  children,
}: {
  icon: ReactNode;
  name: string;
  eyebrow: string;
  accentColor: string;
  status: ProductCardStatus;
  openHref: string;
  primaryAction: ReactNode | null;
  children: ReactNode;
}) {
  return (
    <div
      className="ws-card group flex flex-col overflow-hidden transition-colors duration-200 hover:border-[var(--ws-hairline-strong)]"
      style={{ borderTopColor: accentColor, borderTopWidth: 2 }}
    >
      <div className="flex flex-1 flex-col" style={{ padding: "20px 22px 18px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[9px]">
            <span style={{ color: accentColor }}>{icon}</span>
            <span
              className="text-[13px] font-bold uppercase"
              style={{ letterSpacing: "0.05em", color: "var(--ws-ink)" }}
            >
              {name}
            </span>
          </div>
          {status && (
            <span className="flex items-center gap-[6px] text-[11.5px] font-medium" style={{ color: status.color }}>
              <span className="live-dot" style={{ color: status.color }} />
              {status.label}
            </span>
          )}
        </div>
        <p className="mt-[3px] text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
          {eyebrow}
        </p>

        <div className="mt-[16px] flex flex-1 flex-col">{children}</div>
      </div>

      <div
        className="flex items-center gap-[9px]"
        style={{ padding: "14px 22px", borderTop: "1px solid var(--ws-hairline)" }}
      >
        {primaryAction}
        <div className="flex-1" />
        <Link
          href={openHref}
          className="group/open flex items-center gap-[4px] text-[12.5px] font-semibold"
          style={{ color: "var(--ws-ink)" }}
        >
          Open
          <span className="inline-block transition-transform duration-200 group-hover/open:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}

// Outlier's mini visualization: recent post scores as bars, the outlier
// spike called out directly — not a generic chart, the concept itself.
export function OutlierSpikeChart({ values, peakLabel }: { values: number[]; peakLabel: string | null }) {
  if (values.length === 0) {
    return (
      <div
        className="flex flex-1 items-center justify-center rounded-[8px] text-[12px]"
        style={{ minHeight: 64, background: "var(--ws-surface-header)", color: "var(--ws-ink-45)" }}
      >
        No posts pulled yet
      </div>
    );
  }

  const max = Math.max(...values, 1);
  const peakIndex = values.indexOf(max);

  return (
    <div className="flex flex-1 flex-col justify-end">
      <div className="flex items-end gap-[3px]" style={{ height: 44 }}>
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-[2px]"
            style={{
              height: `${Math.max(10, (v / max) * 100)}%`,
              background: i === peakIndex ? "var(--ws-accent)" : "var(--ws-hairline-strong)",
            }}
          />
        ))}
      </div>
      {peakLabel && (
        <p className="mt-[6px] text-right text-[11px] font-semibold" style={{ color: "var(--ws-accent-text)" }}>
          ↑ {peakLabel}
        </p>
      )}
    </div>
  );
}

// Signal's mini visualization: the real clean/flagged split across
// everything analysed, not a fabricated per-dimension score breakdown.
export function SignalSplitBar({ total, flagged }: { total: number; flagged: number }) {
  if (total === 0) {
    return (
      <div
        className="flex flex-1 items-center justify-center rounded-[8px] text-[12px]"
        style={{ minHeight: 64, background: "var(--ws-surface-header)", color: "var(--ws-ink-45)" }}
      >
        Nothing analysed yet
      </div>
    );
  }

  const clean = total - flagged;
  const cleanPct = (clean / total) * 100;

  return (
    <div className="flex flex-1 flex-col justify-end">
      <div className="h-[8px] overflow-hidden rounded-[4px]" style={{ background: "var(--ws-warn-tint)" }}>
        <div className="h-full rounded-[4px]" style={{ width: `${cleanPct}%`, background: "var(--ws-accent)" }} />
      </div>
      <div className="mt-[8px] flex items-center justify-between text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
        <span>
          <span className="font-semibold" style={{ color: "var(--ws-ink-60)" }}>
            {clean}
          </span>{" "}
          clean
        </span>
        <span>
          <span className="font-semibold" style={{ color: "var(--ws-warn-text)" }}>
            {flagged}
          </span>{" "}
          flagged
        </span>
      </div>
    </div>
  );
}
