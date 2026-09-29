import type { ReactNode } from "react";

// Shared inner-page header — numbered eyebrow, 28px uppercase title,
// optional 13px subtitle — per the design handoff's "Page header" spec.
// WsHero (46px, two-line) is reserved for the three landing-style screens
// (Workspace Overview/Billing/Account, Outlier Home, Signal Library);
// every other page uses this smaller, single-line header instead.
export function WsPageHeader({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-[16px]">
      <div>
        {eyebrow && (
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>
            {eyebrow}
          </p>
        )}
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            color: "var(--ws-ink)",
          }}
        >
          {title}
        </h1>
        {sub && (
          <p style={{ margin: 0, marginTop: 8, fontSize: 13, lineHeight: 1.5, color: "var(--ws-ink-60)", maxWidth: "64ch" }}>
            {sub}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-[9px]">{action}</div>}
    </div>
  );
}
