import type { Metadata } from "next";
import Link from "next/link";
import { getCreators, getPostsByHookTag } from "../../live-data";
import { formatCompact, formatScore } from "../../format";
import { BatchRepurposeButton, AddCreatorButton } from "../../creator-actions";
import { AppMain, Card, Mono, PageHeader, appStyles as s } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";
import { PostCard, PostGrid } from "@/components/app/media";
import { EmptyState } from "@/components/ws-empty-state";

export async function generateMetadata(props: PageProps<"/outlier/tags/[tag]">): Promise<Metadata> {
  const { tag } = await props.params;
  return {
    title: `“${decodeURIComponent(tag)}” — Outlier`,
    robots: { index: false, follow: false },
  };
}

// The hook-tag rabbit hole: click a tag on one post (its own page, or a
// creator's ranked hook-style list) and land here on every post across the
// whole watchlist sharing it, ranked by score.
export default async function HookTagPage(props: PageProps<"/outlier/tags/[tag]">) {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);

  const [creators, posts] = await Promise.all([getCreators(), getPostsByHookTag(decoded)]);

  // Nicely-cased label from an actual match, since matching itself is
  // lowercased/trimmed — falls back to the raw param if nothing matched.
  const label = posts[0]?.hookTags.find((t) => t.trim().toLowerCase() === decoded.trim().toLowerCase()) ?? decoded;
  const ranked = [...posts].sort((a, b) => b.score - a.score);
  const creatorById = new Map(creators.map((c) => [c.id, c]));
  const above2x = ranked.filter((p) => p.score >= 2);
  const avgScore = ranked.length > 0 ? ranked.reduce((sum, p) => sum + p.score, 0) / ranked.length : 0;
  const creatorsUsing = new Set(ranked.map((p) => p.creatorId)).size;

  return (
    <AppMain>
      <Link href="/outlier/feed" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ws-ink-45)", alignSelf: "flex-start" }}>
        <Icon name="chevronLeft" size={14} />
        Feed
      </Link>

      <PageHeader eyebrow="Tag · Hook style" line1={`“${label}”`} actions={ranked.length > 0 ? <BatchRepurposeButton posts={ranked} variant="primary" size="md" /> : undefined} />

      {ranked.length === 0 ? (
        <EmptyState size="large" emoji="🏷️" title="No posts tagged this yet" description="This hook style hasn't shown up in any analyzed post across your watchlist." />
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          <div style={{ flex: "3 1 640px", minWidth: 0 }}>
            <PostGrid cols={3}>
              {ranked.map((post, i) => {
                const creator = creatorById.get(post.creatorId);
                const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle ?? "";
                return (
                  <PostCard
                    key={post.id}
                    href={`/outlier/video/${post.id}`}
                    ring={i === 0}
                    tile={{ src: post.thumbnailUrl, platform: post.platform, score: formatScore(post.score), scoreAccent: post.score >= 2, height: 300, emoji: "🎬" }}
                    creator={{ initials: creator?.initials ?? "?", handle, avatarUrl: creator?.avatarUrl }}
                    date={post.postedAt}
                    caption={post.caption.split("\n")[0]}
                    views={formatCompact(post.views)}
                    engagement={`${post.engagement.toFixed(1)}%`}
                    hook={post.hookTags[0]}
                  />
                );
              })}
            </PostGrid>
          </div>

          <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {creatorsUsing < 2 && (
              <Card>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span className={s.emo} style={{ fontSize: 26 }} aria-hidden="true">
                    🌱
                  </span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>Only one creator uses this hook so far</span>
                    <span style={{ fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.5 }}>
                      It shows up in Trends once two or more creators use it. Track more creators in this space to see if it holds.
                    </span>
                  </div>
                </div>
                <div>
                  <AddCreatorButton variant="ghost" size="sm" />
                </div>
              </Card>
            )}
            <Card style={{ gap: 0, padding: 0 }}>
              {[
                { label: "Posts above 2×", value: String(above2x.length) },
                { label: "Average score", value: formatScore(avgScore) },
                { label: "Creators using it", value: `${creatorsUsing} of ${creators.length}` },
              ].map((row, i) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: i === 0 ? "none" : "1px solid var(--ws-hairline)" }}>
                  <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                    {row.label}
                  </Mono>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </AppMain>
  );
}
