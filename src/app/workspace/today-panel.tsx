import Link from "next/link";

export type TodayInsight = {
  id: string;
  text: string;
  meta?: string;
  href: string;
};

// Deliberately data-driven rather than hardcoded copy: page.tsx computes a
// small list of real, already-true things (never fabricated metrics) and
// this just renders however many there are — zero, one, or several, and
// as more Creos products ship, their own insights slot into the same list.
// Uses the same ws-card surface as every other box in the workspace (white
// in light mode, dark in dark mode) rather than a fixed dark treatment, so
// it stays consistent with the rest of the page instead of standing out as
// a mismatched block.
export function TodayPanel({ insights, viewAllHref }: { insights: TodayInsight[]; viewAllHref: string }) {
  if (insights.length === 0) return null;

  return (
    <div className="ws-page-in ws-card overflow-hidden">
      <div style={{ padding: "22px 26px 24px" }}>
        <p className="ws-eyebrow">Today</p>
        <p className="mt-[8px] text-[17px] font-semibold tracking-[-0.01em]" style={{ color: "var(--ws-ink)" }}>
          {insights.length} thing{insights.length === 1 ? "" : "s"} worth your attention.
        </p>

        <div className="mt-[18px] grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          {insights.map((insight) => (
            <Link
              key={insight.id}
              href={insight.href}
              className="rounded-[10px] border border-transparent transition-colors duration-200 hover:border-[var(--ws-hairline-strong)]"
              style={{ padding: "12px 14px", background: "var(--ws-surface-header)" }}
            >
              <p className="text-[13.5px] font-medium leading-snug" style={{ color: "var(--ws-ink)" }}>
                {insight.text}
              </p>
              {insight.meta && (
                <p className="mt-[4px] text-[12px] leading-snug" style={{ color: "var(--ws-ink-45)" }}>
                  {insight.meta}
                </p>
              )}
            </Link>
          ))}
        </div>

        <Link href={viewAllHref} className="ws-link-accent group/link mt-[18px] inline-flex items-center gap-[6px] text-[12.5px] font-medium">
          View everything
          <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
