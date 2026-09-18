import type { Metadata } from "next";
import { TOPICS, HOOK_STYLES, getCreator } from "../data";
import { Avatar, EmptyState, Sparkline } from "../components";

export const metadata: Metadata = {
  title: "Trends — Outlier",
  robots: { index: false, follow: false },
};

export default function TrendsPage() {
  const maxHookScore = HOOK_STYLES.length > 0 ? Math.max(...HOOK_STYLES.map((h) => h.avgMultiplier)) : 1;

  if (TOPICS.length === 0 && HOOK_STYLES.length === 0) {
    return (
      <div className="ws-page-in flex min-h-[70vh] items-center justify-center px-6 py-[22px]">
        <EmptyState
          size="large"
          title="Not enough data yet"
          description="Trends need a few pulled creators with several posts each before patterns are worth surfacing."
        />
      </div>
    );
  }

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
        Trends
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
        Topics and hook styles converting across your watchlist.
      </p>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-2">
        <div>
          <p className="ws-eyebrow">TOPICS BEATING THEIR OWN MEDIAN</p>
          {TOPICS.length === 0 ? (
            <div className="ws-card mt-[12px]">
              <EmptyState title="No topics yet" description="Needs at least a few creators beating their own median on the same theme." />
            </div>
          ) : (
          <div className="mt-[12px] flex flex-col gap-[12px]">
            {TOPICS.map((topic) => (
              <div key={topic.id} className="ws-card" style={{ padding: "16px 18px" }}>
                <div className="flex items-center justify-between">
                  <p className="text-[13.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {topic.name}
                  </p>
                  <span className="ws-tabular text-[15px] font-semibold" style={{ color: "var(--ws-accent-text)" }}>
                    {topic.avgMultiplier.toFixed(1)}× avg
                  </span>
                </div>
                <div className="mt-[10px] flex items-center gap-[10px]">
                  <Sparkline values={topic.spark} trend={1} />
                  <div className="flex -space-x-2">
                    {topic.creators.map((cid) => {
                      const creator = getCreator(cid);
                      return creator ? <Avatar key={cid} initials={creator.initials} size={22} /> : null;
                    })}
                  </div>
                  <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                    {topic.creators.length} creator{topic.creators.length === 1 ? "" : "s"} hitting it
                  </span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div>
          <p className="ws-eyebrow">HOOK STYLES CONVERTING REGARDLESS OF TOPIC</p>
          {HOOK_STYLES.length === 0 ? (
            <div className="ws-card mt-[12px]">
              <EmptyState title="No hook styles yet" description="Needs a few posts sharing a similar opener before a pattern is worth naming." />
            </div>
          ) : (
          <div className="mt-[12px] flex flex-col gap-[10px]">
            {HOOK_STYLES.map((hook) => (
              <div key={hook.name} className="ws-card" style={{ padding: "14px 16px" }}>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {hook.name}
                  </p>
                  <span className="ws-tabular text-[13px] font-semibold" style={{ color: "var(--ws-accent-text)" }}>
                    {hook.avgMultiplier.toFixed(1)}×
                  </span>
                </div>
                <p className="mt-[4px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                  {hook.example}
                </p>
                <div className="mt-[8px] h-[4px] overflow-hidden rounded-[20px]" style={{ background: "var(--ws-hairline)" }}>
                  <div
                    className="h-full rounded-[20px]"
                    style={{ width: `${(hook.avgMultiplier / maxHookScore) * 100}%`, background: "var(--ws-accent)" }}
                  />
                </div>
              </div>
            ))}
          </div>
          )}

          {HOOK_STYLES.length > 0 && (
          <div
            className="mt-[14px] rounded-[10px]"
            style={{ padding: "16px 18px", background: "var(--ws-accent-tint)", border: "1px solid var(--ws-accent-tint-border)" }}
          >
            <p className="ws-eyebrow" style={{ color: "var(--ws-accent-tint-ink)" }}>
              WORTH REPURPOSING
            </p>
            <p className="mt-[10px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-accent-tint-ink)" }}>
              Negative-command openers are outperforming every other hook style regardless of topic —
              consider testing one against your next three posts.
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
