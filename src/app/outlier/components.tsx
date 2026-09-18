import type { Platform } from "./data";
import { formatScore } from "./format";

export function Avatar({ initials, size = 26 }: { initials: string; size?: number }) {
  return (
    <span
      className="ws-placeholder flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size <= 22 ? 9 : 10.5,
        color: "var(--ws-ink-60)",
        border: "1px solid var(--ws-hairline)",
      }}
    >
      {initials}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className="rounded-[5px] font-semibold uppercase"
      style={{
        fontSize: 9,
        letterSpacing: "0.08em",
        padding: "3px 6px",
        background: "color-mix(in srgb, var(--ws-surface) 93%, transparent)",
        color: "var(--ws-ink)",
        border: "1px solid var(--ws-hairline)",
      }}
    >
      {platform}
    </span>
  );
}

export function ThinHistoryPill() {
  return (
    <span
      className="whitespace-nowrap rounded-[20px] font-semibold uppercase"
      style={{
        fontSize: 9,
        letterSpacing: "0.06em",
        padding: "3px 7px",
        background: "color-mix(in srgb, var(--ws-surface) 93%, transparent)",
        color: "var(--ws-warn-text)",
        border: "1px solid var(--ws-hairline)",
      }}
    >
      thin history
    </span>
  );
}

export function ScoreChip({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) {
  const filled = score >= 4;
  const big = size === "lg";
  return (
    <span
      className="inline-flex items-center rounded-[8px] font-semibold"
      style={{
        fontSize: big ? 20 : 18,
        letterSpacing: "-0.035em",
        padding: big ? "6px 9px 7px" : "5px 7px 6px",
        background: filled ? "var(--ws-accent)" : "var(--ws-surface)",
        color: filled ? "var(--ws-accent-ink)" : "var(--ws-ink)",
        border: filled ? "none" : "1px solid var(--ws-hairline)",
      }}
    >
      {formatScore(score)}
    </span>
  );
}

export function ProgressBar({
  pct,
  height = 4,
}: {
  pct: number;
  height?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-[3px]"
      style={{ height, background: "rgba(128,128,128,.14)" }}
    >
      <div
        className="h-full rounded-[3px]"
        style={{ width: `${Math.min(100, pct)}%`, background: "var(--ws-accent)" }}
      />
    </div>
  );
}

export function Sparkline({ values, trend }: { values: number[]; trend: number | null }) {
  const max = Math.max(...values, 1);
  const color =
    trend === null ? "var(--ws-ink-45)" : trend >= 0 ? "var(--ws-accent-text)" : "var(--ws-warn-text)";
  return (
    <div className="flex items-end" style={{ height: 22, gap: 2 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: trend === null ? "var(--ws-ink-45)" : color,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

export { EmptyState } from "@/components/ws-empty-state";

export function Thumb({
  aspectRatio,
  radius = 8,
  style,
  children,
}: {
  aspectRatio: string;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="ws-placeholder relative shrink-0 overflow-hidden"
      style={{ aspectRatio, borderRadius: radius, ...style }}
    >
      {children}
    </div>
  );
}
