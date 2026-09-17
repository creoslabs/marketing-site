import type { Format } from "./data";

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
