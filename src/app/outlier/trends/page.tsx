import type { Metadata } from "next";
import { getHookStylePatterns, getPostsByHookTag } from "../live-data";
import { BatchRepurposeButton } from "../creator-actions";

export const metadata: Metadata = {
  title: "Trends — Outlier",
  robots: { index: false, follow: false },
};

export default async function TrendsPage() {
  const patterns = await getHookStylePatterns();
  const top = patterns[0] ?? null;
  const maxScore = top ? top.avgScore : 1;
  const topPosts = top ? await getPostsByHookTag(top.tag) : [];

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <p className="ws-eyebrow">03 / TRENDS</p>
      <h1 className="mt-[10px] text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
        What&rsquo;s working across the watchlist.
      </h1>
      <p className="mt-2 max-w-[64ch] text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
        Hook styles that beat the median regardless of topic, shared by at least two creators. Thin-history handles
        are excluded.
      </p>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_352px]">
        <div className="ws-card" style={{ padding: "18px 20px 20px" }}>
          <div className="flex items-baseline">
            <p className="ws-eyebrow">HOOK STYLES CONVERTING</p>
            <div className="flex-1" />
            <p className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
              topic-agnostic
            </p>
          </div>

          {patterns.length > 0 ? (
            <div className="mt-[14px] flex flex-col gap-[16px]">
              {patterns.map((p) => (
                <div key={p.tag} className="flex items-center gap-[16px]">
                  <div style={{ width: 160, flex: "none" }}>
                    <p className="truncate text-[13px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {p.tag}
                    </p>
                    <p className="mt-[2px] text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                      {p.postCount} post{p.postCount === 1 ? "" : "s"} · {p.creatorCount} creators
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-[3px]" style={{ height: 6, background: "rgba(128,128,128,.14)" }}>
                    <div
                      className="h-full rounded-[3px]"
                      style={{ width: `${Math.min(100, (p.avgScore / maxScore) * 100)}%`, background: "var(--ws-accent)" }}
                    />
                  </div>
                  <p className="ws-tabular text-right text-[13px] font-semibold" style={{ width: 40, flex: "none", color: "var(--ws-ink)" }}>
                    {p.avgScore.toFixed(1)}×
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-[14px] text-[12.5px]" style={{ color: "var(--ws-ink-45)" }}>
              No hook style has enough analyzed posts across two or more creators yet — analyze a few more posts to
              see patterns emerge.
            </p>
          )}
        </div>

        {top && (
          <div
            className="rounded-[10px]"
            style={{ padding: "18px 20px 20px", background: "var(--ws-accent-tint)", border: "1px solid var(--ws-accent-tint-border)" }}
          >
            <p className="ws-eyebrow" style={{ color: "var(--ws-accent-tint-ink)" }}>
              WORTH REPURPOSING
            </p>
            <p className="mt-[10px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-accent-tint-ink)" }}>
              &ldquo;{top.tag}&rdquo; averaged {top.avgScore.toFixed(1)}× across {top.postCount} posts from{" "}
              {top.creatorCount} creators you track.
            </p>
            <div className="mt-[14px]">
              <BatchRepurposeButton
                posts={topPosts}
                className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
                style={{ padding: "10px 14px" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
