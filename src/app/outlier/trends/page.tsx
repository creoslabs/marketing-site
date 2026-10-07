import type { Metadata } from "next";
import Link from "next/link";
import { getHookStylePatterns, getPostsByHookTag } from "../live-data";
import { BatchRepurposeButton } from "../creator-actions";
import { formatScore } from "../format";
import { AppMain, Card, CardHead, Mono, PageHeader, appStyles as s } from "@/components/app/ui";
import { MediaTile } from "@/components/app/media";

export const metadata: Metadata = {
  title: "Trends — Outlier",
  robots: { index: false, follow: false },
};

export default async function TrendsPage() {
  const patterns = await getHookStylePatterns();
  const top = patterns[0] ?? null;
  const maxScore = top ? top.avgScore : 1;
  const topPosts = top ? await getPostsByHookTag(top.tag) : [];
  const topThumbs = [...topPosts].sort((a, b) => b.score - a.score).slice(0, 2);
  const eligible = topPosts.filter((p) => p.analysisStatus === "done").length;

  return (
    <AppMain>
      <PageHeader
        eyebrow="03 / Trends"
        line1="What’s working"
        line2="across the watchlist."
        sub="Hook styles that beat the median regardless of topic, shared by at least two creators. Thin-history handles are excluded."
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "2 1 700px", minWidth: 0 }}>
          <Card style={{ padding: 26 }}>
            <CardHead
              label="Hook styles beating the median"
              right={
                <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                  Topic-agnostic
                </Mono>
              }
            />
            {patterns.length > 0 ? (
              <div>
                {patterns.map((p, i) => (
                  <div key={p.tag} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0", borderTop: i === 0 ? "none" : "1px solid var(--ws-hairline)", flexWrap: "wrap" }}>
                    <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 4 }}>
                      <Link href={`/outlier/tags/${encodeURIComponent(p.tag)}`} style={{ fontSize: 17, fontWeight: 700 }}>
                        {p.tag}
                      </Link>
                      <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>
                        {p.postCount} post{p.postCount === 1 ? "" : "s"} · {p.creatorCount} creators
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 120, height: 12, borderRadius: 6, background: "var(--ws-surface-header)" }} aria-hidden="true">
                      <div style={{ width: `${Math.min(100, (p.avgScore / maxScore) * 100)}%`, height: 12, borderRadius: 6, background: i === 0 ? "var(--ws-accent)" : "var(--ws-grey)" }} />
                    </div>
                    <span className={s.disp} style={{ width: 90, textAlign: "right", fontSize: 26, color: i === 0 ? "var(--ws-accent)" : undefined }}>
                      {formatScore(p.avgScore)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--ws-surface-header)", borderRadius: 14, padding: "14px 16px" }}>
                <span className={s.emo} style={{ fontSize: 18 }} aria-hidden="true">
                  🌱
                </span>
                <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>
                  No hook style has enough analyzed posts across two or more creators yet — analyze a few more posts to see patterns emerge.
                </span>
              </div>
            )}
          </Card>
        </div>

        {top && (
          <div style={{ flex: "1 1 340px", minWidth: 0 }}>
            <Card paper ring style={{ padding: 24 }}>
              <Mono className={s.cardLabel} style={{ fontSize: 10, color: "#55534d" }}>
                Worth repurposing
              </Mono>
              <span className={s.disp} style={{ fontSize: 30, lineHeight: 0.95 }}>
                {top.tag}
              </span>
              <span style={{ fontSize: 15, color: "#46443f", lineHeight: 1.5 }}>
                Averaged <b style={{ color: "#0b0b0a" }}>{formatScore(top.avgScore)}</b> across {top.postCount} posts from {top.creatorCount} creators you track.
                {eligible > 0 ? ` Turn the top ${Math.min(3, eligible)} into scripts for your own content.` : " Analyze a few of them to turn them into scripts."}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {topThumbs.map((p) => (
                  <div key={p.id} style={{ width: 70, flex: "none" }}>
                    <MediaTile src={p.thumbnailUrl} height={110} emoji="🎬" />
                  </div>
                ))}
              </div>
              <div>
                <BatchRepurposeButton posts={topPosts} variant="ink" size="md" />
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppMain>
  );
}
