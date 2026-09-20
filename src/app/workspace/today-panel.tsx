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
// calm workspace that echoes the Creos marketing identity. A flat black
// rectangle read as an error state rather than a deliberate accent, so this
// carries a soft brand-colour glow and a gradient rather than solid black —
// enough to look intentional against the light canvas in either theme.
export function TodayPanel({ insights, viewAllHref }: { insights: TodayInsight[]; viewAllHref: string }) {
  if (insights.length === 0) return null;

  return (
    <div
      className="ws-page-in relative overflow-hidden rounded-[14px]"
      style={{
        background: "linear-gradient(155deg, #131316 0%, #0b0b0d 55%, #0d0d10 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 12px 40px -16px rgba(41,151,255,0.22), 0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-[220px] w-[220px] rounded-full"
        style={{ background: "rgba(41,151,255,0.16)", filter: "blur(70px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-1/3 h-[180px] w-[180px] rounded-full"
        style={{ background: "rgba(139,92,246,0.12)", filter: "blur(70px)" }}
      />

      <div className="relative" style={{ padding: "22px 26px 24px" }}>
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
              className="group rounded-[10px] transition-colors duration-200 hover:bg-white/[0.08]"
              style={{ padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}
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
