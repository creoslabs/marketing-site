import type { Format, Platform } from "./data";

export function Thumb({
  aspectRatio,
  radius = 10,
  style,
  className,
  children,
}: {
  aspectRatio: string;
  radius?: number;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`ws-placeholder relative shrink-0 overflow-hidden${className ? ` ${className}` : ""}`}
      style={{ aspectRatio, borderRadius: radius, ...style }}
    >
      {children}
    </div>
  );
}

export function ScoreBadge({ score, format }: { score: number; format: Format }) {
  const isStatic = format === "static";
  return (
    <div
      className="inline-flex flex-col rounded-[7px]"
      style={{
        padding: "7px 9px",
        background: isStatic ? "var(--ws-accent)" : "var(--ws-ink)",
        color: isStatic ? "var(--ws-accent-ink)" : "var(--ws-ground)",
      }}
    >
      <span className="ws-tabular text-[16px] font-bold leading-none">{score}</span>
      <span className="mt-[3px] text-[8.5px] font-semibold uppercase leading-none" style={{ letterSpacing: "0.06em", opacity: 0.85 }}>
        {format} · {format === "video" ? "16" : "7"}
      </span>
    </div>
  );
}

// Only rendered for a creative that targets more than one platform — the
// score/criteria mix (specifically the safe-zone verdict) can differ per
// platform since each platform's UI chrome occupies different margins.
export function PlatformTabs({
  platforms,
  selected,
  onSelect,
}: {
  platforms: Platform[];
  selected: Platform;
  onSelect: (platform: Platform) => void;
}) {
  if (platforms.length <= 1) return null;
  return (
    <div className="inline-flex rounded-[7px] p-[2px]" style={{ border: "1px solid var(--ws-hairline)" }}>
      {platforms.map((platform) => (
        <button
          key={platform}
          type="button"
          onClick={() => onSelect(platform)}
          className="rounded-[5px] px-[10px] py-[5px] text-[11.5px] font-medium"
          style={
            platform === selected
              ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
              : { color: "var(--ws-ink-60)" }
          }
        >
          {platform}
        </button>
      ))}
    </div>
  );
}

export function IssuePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="whitespace-nowrap rounded-[20px] font-semibold"
      style={{
        fontSize: 10.5,
        padding: "4px 9px",
        background: "var(--ws-warn)",
        color: "var(--ws-warn-ink)",
      }}
    >
      {children}
    </span>
  );
}

export function InvertedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="whitespace-nowrap rounded-[4px] font-semibold uppercase"
      style={{
        fontSize: 11,
        letterSpacing: "0.06em",
        padding: "4px 7px",
        background: "var(--ws-ink)",
        color: "var(--ws-ground)",
      }}
    >
      {children}
    </span>
  );
}


const VERDICT_COLOR: Record<string, string> = {
  pass: "var(--ws-accent-text)",
  fail: "var(--ws-warn-text)",
  partial: "var(--ws-ink-60)",
};

export function VerdictLabel({ verdict }: { verdict: "pass" | "partial" | "fail" }) {
  return (
    <span className="text-[12px] font-semibold capitalize" style={{ color: VERDICT_COLOR[verdict] }}>
      {verdict}
    </span>
  );
}

// A ring gauge, not a formula — the score is the same weighted pass/partial/
// fail computeScore() in lib/signal/pipeline.ts produces, but shown as a
// glanceable shape instead of spelled-out arithmetic. Colors match
// VerdictLabel elsewhere in the report. `revealed` drives the same
// draw-in-on-mount treatment the median bars below it already use.
export function ScoreBreakdown({
  score,
  pass,
  partial,
  fail,
  revealed = true,
}: {
  score: number;
  pass: number;
  partial: number;
  fail: number;
  revealed?: boolean;
}) {
  const total = pass + partial + fail;
  if (total === 0) return null;

  const size = 104;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { count: pass, color: VERDICT_COLOR.pass, label: "pass" },
    { count: partial, color: "var(--ws-ink-45)", label: "partial" },
    { count: fail, color: VERDICT_COLOR.fail, label: "fail" },
  ];

  let cursor = 0;
  const arcs = segments
    .filter((s) => s.count > 0)
    .map((s) => {
      const length = (s.count / total) * circumference;
      const arc = { ...s, length, start: cursor };
      cursor += length;
      return arc;
    });

  return (
    <div className="flex items-center gap-[18px]">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(128,128,128,.14)" strokeWidth={stroke} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.length} ${circumference - a.length}`}
              strokeDashoffset={revealed ? -a.start : -circumference}
              style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="ws-tabular font-bold" style={{ fontSize: 30, letterSpacing: "-0.03em", color: "var(--ws-ink)" }}>
            {score}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        {segments.map((s) => (
          <span key={s.label} className="ws-tabular inline-flex items-center gap-[7px] text-[13px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: s.color, display: "inline-block" }} />
            {s.count} {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
