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
// A dark surface on purpose: this is the one place in an otherwise light,
// calm workspace that echoes the Creos marketing identity, so it reads as
// the deliberate focal point rather than another white card.
export function TodayPanel({ insights, viewAllHref }: { insights: TodayInsight[]; viewAllHref: string }) {
  if (insights.length === 0) return null;

  return (
    <div
      className="ws-page-in overflow-hidden rounded-[14px]"
      style={{ background: "#0b0b0d", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div style={{ padding: "22px 26px 24px" }}>
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.13em]"
          style={{ color: "rgba(245,245,247,0.5)" }}
        >
          Today
        </p>
        <p className="mt-[8px] text-[17px] font-semibold tracking-[-0.01em]" style={{ color: "#f5f5f7" }}>
          {insights.length} thing{insights.length === 1 ? "" : "s"} worth your attention.
        </p>

        <div className="mt-[18px] grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          {insights.map((insight) => (
            <Link
              key={insight.id}
              href={insight.href}
              className="group rounded-[10px] transition-colors duration-200 hover:bg-white/[0.07]"
              style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-[13.5px] font-medium leading-snug" style={{ color: "#f5f5f7" }}>
                {insight.text}
              </p>
              {insight.meta && (
                <p className="mt-[4px] text-[12px] leading-snug" style={{ color: "rgba(245,245,247,0.5)" }}>
                  {insight.meta}
                </p>
              )}
            </Link>
          ))}
        </div>

        <Link
          href={viewAllHref}
          className="group/link mt-[18px] inline-flex items-center gap-[6px] text-[12.5px] font-medium transition-colors duration-200 hover:text-white"
          style={{ color: "#8cbfff" }}
        >
          View everything
          <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
