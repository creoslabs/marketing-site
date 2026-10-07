"use client";

import { useMemo, useState } from "react";
import type { Post } from "../../data";
import { formatCompact, formatScore } from "../../format";
import { Button, Card, CardHead, appStyles as s, cx } from "@/components/app/ui";
import { PostCard, PostGrid } from "@/components/app/media";

const PAGE_SIZE = 20;
type Order = "score" | "recent";

// A creator's posts: top score by default, most recent, or outliers only.
export function CreatorPosts({ posts, creator }: { posts: Post[]; creator: { initials: string; avatarUrl: string | null; handleFor: Record<string, string> } }) {
  const [order, setOrder] = useState<Order>("score");
  const [outliersOnly, setOutliersOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const ranked = useMemo(() => {
    const base = outliersOnly ? posts.filter((p) => p.score >= 2) : posts;
    return [...base].sort((a, b) => (order === "score" ? b.score - a.score : new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime()));
  }, [posts, order, outliersOnly]);
  const shown = ranked.slice(0, visible);

  return (
    <Card>
      <CardHead
        label="Posts"
        right={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" aria-pressed={order === "score"} className={cx(s.mono, s.chip, s.chipButton, order === "score" ? s.chipPaper : s.chipOutline)} onClick={() => setOrder("score")}>
              Top score
            </button>
            <button type="button" aria-pressed={order === "recent"} className={cx(s.mono, s.chip, s.chipButton, order === "recent" ? s.chipPaper : s.chipOutline)} onClick={() => setOrder("recent")}>
              Most recent
            </button>
            <button type="button" aria-pressed={outliersOnly} className={cx(s.mono, s.chip, s.chipButton, outliersOnly ? s.chipPaper : s.chipOutline)} onClick={() => setOutliersOnly((v) => !v)}>
              Above 2× only
            </button>
          </div>
        }
      />
      {ranked.length === 0 ? (
        <p style={{ margin: 0, padding: "24px 0", textAlign: "center", fontSize: 14, color: "var(--ws-ink-45)" }}>No posts match.</p>
      ) : (
        <>
          <PostGrid cols={5}>
            {shown.map((post, i) => (
              <PostCard
                key={post.id}
                href={`/outlier/video/${post.id}`}
                ring={i === 0 && order === "score"}
                tile={{ src: post.thumbnailUrl, platform: post.platform, score: formatScore(post.score), scoreAccent: post.score >= 2, height: 260, emoji: "🎬" }}
                creator={{ initials: creator.initials, handle: creator.handleFor[post.platform] ?? "", avatarUrl: creator.avatarUrl }}
                date={post.postedAt}
                caption={post.caption.split("\n")[0]}
                views={formatCompact(post.views)}
                engagement={`${post.engagement.toFixed(1)}%`}
                hook={post.hookTags[0]}
              />
            ))}
          </PostGrid>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {visible < ranked.length && (
              <Button variant="ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show {Math.min(PAGE_SIZE, ranked.length - visible)} more
              </Button>
            )}
            <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>
              Showing {shown.length} of {ranked.length}
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
