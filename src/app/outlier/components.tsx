import type { Platform } from "./data";
import { formatCompact, formatScore } from "./format";

export function Avatar({ initials, avatarUrl, size = 26 }: { initials: string; avatarUrl?: string | null; size?: number }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a scraped CDN URL, not a static asset next/image can optimize
      <img
        src={avatarUrl}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size, border: "1px solid var(--ws-hairline)" }}
      />
    );
  }
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

const PLATFORM_ICON: Record<Platform, { bg: string; icon: React.ReactNode }> = {
  TT: {
    bg: "#000000",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16.6 5.82c-.9-.85-1.47-2-1.6-3.32h-3.14v13.44c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1 0-5.44c.26 0 .5.03.74.1V10.2a5.9 5.9 0 0 0-.74-.05 5.86 5.86 0 1 0 5.86 5.86V9.28a8.2 8.2 0 0 0 4.8 1.54V7.68a4.98 4.98 0 0 1-3.2-1.86Z"
          fill="#fff"
        />
      </svg>
    ),
  },
  IG: {
    bg: "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="#fff" strokeWidth="2" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
      </svg>
    ),
  },
  YT: {
    bg: "#FF0000",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 8.5v7l6-3.5-6-3.5Z" fill="#fff" />
      </svg>
    ),
  },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const { bg, icon } = PLATFORM_ICON[platform];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[6px]"
      style={{ width: 20, height: 20, background: bg }}
      aria-label={platform === "TT" ? "TikTok" : platform === "IG" ? "Instagram" : "YouTube"}
    >
      {icon}
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

// median is optional only for callers that genuinely don't have it handy —
// pass it whenever available so the score reads as "3.1x this creator's own
// median" on hover instead of a bare, unexplained multiplier.
export function ScoreChip({ score, median, size = "sm" }: { score: number; median?: number; size?: "sm" | "lg" }) {
  const filled = score >= 4;
  const big = size === "lg";
  return (
    <span
      className="inline-flex items-center rounded-[8px] font-semibold"
      title={median !== undefined ? `${formatScore(score)} this creator's median — ${median.toLocaleString()} views` : undefined}
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

function EyeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 12c1.9-4.2 5.6-7 10-7s8.1 2.8 10 7c-1.9 4.2-5.6 7-10 7s-8.1-2.8-10-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function BoltIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 2.5 4 14h6l-1 7.5L20 10h-6l-1.5-7.5Z" fill="currentColor" />
    </svg>
  );
}

// Views and engagement rate are the two numbers that actually explain why a
// post is or isn't an outlier — shown as small labeled chips (icon + value)
// so they read at a glance instead of blending into gray metadata text.
export function StatRow({ views, engagement, size = "md" }: { views: number; engagement: number; size?: "md" | "sm" }) {
  const valueSize = size === "md" ? 12.5 : 11;
  const iconSize = size === "md" ? 11 : 10;
  const padding = size === "md" ? "4px 8px 5px" : "3px 6px 4px";
  const gap = size === "md" ? 6 : 5;
  return (
    <div className="flex items-center" style={{ gap }}>
      <span
        className="ws-tabular inline-flex items-center rounded-[6px] font-semibold"
        style={{ gap: 4, padding, background: "var(--ws-surface-header)", color: "var(--ws-ink)", fontSize: valueSize }}
      >
        <EyeIcon size={iconSize} />
        {formatCompact(views)}
      </span>
      <span
        className="ws-tabular inline-flex items-center rounded-[6px] font-semibold"
        style={{
          gap: 4,
          padding,
          background: "var(--ws-accent-tint)",
          color: "var(--ws-accent-tint-ink)",
          fontSize: valueSize,
        }}
      >
        <BoltIcon size={iconSize} />
        {engagement.toFixed(1)}%
      </span>
    </div>
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
