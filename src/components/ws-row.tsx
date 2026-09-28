import type { ReactNode } from "react";

// Label/value/action row used throughout Account (Profile, Security,
// Connected accounts) — meant to sit inside a `.ws-stack` container, which
// already provides the 1px-hairline-divider-over-surface trick.
export function WsRow({
  label,
  value,
  action,
  labelWidth = 140,
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
  labelWidth?: number;
}) {
  return (
    <div className="flex items-center" style={{ gap: 16, padding: "15px 18px" }}>
      <div style={{ width: labelWidth, flex: "none", fontSize: 12.5, color: "var(--ws-ink-60)" }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 500, lineHeight: 1.3, color: "var(--ws-ink)" }}>
        {value}
      </div>
      {action && (
        <div style={{ flex: "none", fontSize: 11.5, fontWeight: 500, color: "var(--ws-accent-text)", whiteSpace: "nowrap" }}>
          {action}
        </div>
      )}
    </div>
  );
}
