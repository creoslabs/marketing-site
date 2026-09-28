import type { ReactNode } from "react";
import { WsButton } from "@/components/ws-button";

export function OverviewProductCard({
  eyebrow,
  statusMeta,
  name,
  description,
  score,
  scoreUnit,
  scoreMeta,
  viz,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  statusMeta: string;
  name: string;
  description: string;
  score: string;
  scoreUnit: string;
  scoreMeta: string;
  viz: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <div className="ws-card" style={{ padding: "26px 28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="flex items-baseline" style={{ gap: 10 }}>
        <p className="ws-eyebrow">{eyebrow}</p>
        <div className="flex-1" />
        <p style={{ fontSize: 11.5, color: "var(--ws-ink-45)", whiteSpace: "nowrap" }}>{statusMeta}</p>
      </div>

      <div className="flex items-end" style={{ gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ws-ink)" }}>
            {name}
          </p>
          <p style={{ margin: 0, marginTop: 10, fontSize: 13, lineHeight: 1.5, color: "var(--ws-ink-60)" }}>
            {description}
          </p>
        </div>
        <div style={{ textAlign: "right", flex: "none" }}>
          <p
            className="ws-tabular"
            style={{ margin: 0, fontSize: 52, lineHeight: 0.85, fontWeight: 700, letterSpacing: "-0.035em", color: "var(--ws-ink)" }}
          >
            {score}
            <span style={{ fontSize: 22, color: "var(--ws-ink-45)", letterSpacing: 0 }}>{scoreUnit}</span>
          </p>
          <p className="ws-eyebrow" style={{ marginTop: 10, whiteSpace: "nowrap" }}>
            {scoreMeta}
          </p>
        </div>
      </div>

      {viz}

      <div
        className="flex items-center"
        style={{ gap: 9, paddingTop: 20, marginTop: "auto", borderTop: "1px solid var(--ws-hairline)" }}
      >
        <WsButton variant="primary" href={primaryHref}>
          {primaryLabel}
        </WsButton>
        <WsButton variant="ghost" href={secondaryHref}>
          {secondaryLabel}
        </WsButton>
      </div>
    </div>
  );
}
