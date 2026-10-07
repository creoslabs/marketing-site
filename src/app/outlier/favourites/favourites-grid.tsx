"use client";

import { useState } from "react";
import type { Collection, Creator, Post } from "../data";
import { formatCompact, formatScore } from "../format";
import { CollectionMenu, NewCollectionButton } from "../collection-menu";
import { AppMain, Button, PageHeader, appStyles as s, cx } from "@/components/app/ui";
import { PostCard, PostGrid } from "@/components/app/media";
import { EmptyState } from "@/components/ws-empty-state";

// Decorative three-card stack for the empty state — an illustration of what a
// saved post looks like, not real data.
function EmptyStack() {
  const tile = (left: number, top: number, emoji: string, score: string, extra: React.CSSProperties) => (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left,
        top,
        width: 100,
        height: 150,
        borderRadius: 16,
        overflow: "hidden",
        background: "radial-gradient(120% 80% at 30% 20%, #34322c 0%, #1a1917 55%, #0f0f0e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...extra,
      }}
    >
      <span className={s.emo} style={{ fontSize: 30 }}>
        {emoji}
      </span>
      <span className={s.disp} style={{ position: "absolute", left: 10, bottom: 10, fontSize: 18, letterSpacing: "-0.02em", padding: "5px 9px", borderRadius: 10, background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }}>
        {score}
      </span>
    </div>
  );
  return (
    <div style={{ position: "relative", width: 220, height: 160 }}>
      {tile(0, 10, "🛹", "79.0×", { transform: "rotate(-8deg)", opacity: 0.6 })}
      {tile(60, 0, "🧔🏻", "120.4×", { zIndex: 1, boxShadow: "0 0 0 2px var(--ws-accent)" })}
      {tile(120, 10, "💐", "20.7×", { transform: "rotate(8deg)", opacity: 0.6 })}
      <span className={s.emo} style={{ position: "absolute", right: 18, top: -14, fontSize: 30, zIndex: 2 }} aria-hidden="true">
        ⭐
      </span>
    </div>
  );
}

export function FavouritesGrid({ posts, creators, collections }: { posts: Post[]; creators: Creator[]; collections: Collection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const creatorById = new Map(creators.map((c) => [c.id, c]));
  const visiblePosts = activeId ? posts.filter((p) => collections.find((c) => c.id === activeId)?.postIds.includes(p.id)) : posts;

  return (
    <AppMain>
      <PageHeader
        eyebrow="Favourites"
        line1="Saved posts."
        sub={`${posts.length} saved · ${collections.length} collection${collections.length === 1 ? "" : "s"}`}
        actions={posts.length > 0 ? <NewCollectionButton /> : undefined}
      />

      {posts.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            padding: "72px 24px",
            textAlign: "center",
            background: "var(--ws-surface)",
            border: "1px dashed var(--ws-hairline-strong)",
            borderRadius: 24,
          }}
        >
          <EmptyStack />
          <h2 className={s.disp} style={{ margin: "16px 0 0", fontSize: 32 }}>
            No favourites yet.
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: "var(--ws-ink-60)", maxWidth: 420, lineHeight: 1.5 }}>
            Star a post from its page to save it here. Group favourites into collections — “hooks to steal”, “Q4 ideas” — when you have a few.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" href="/outlier/feed">
              Browse top outliers
            </Button>
            <NewCollectionButton />
          </div>
        </div>
      ) : (
        <>
          <div className={s.toolbar}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="group" aria-label="Collection">
              <button type="button" aria-pressed={activeId === null} className={cx(s.mono, s.chip, s.chipButton, activeId === null ? s.chipPaper : s.chipOutline)} onClick={() => setActiveId(null)}>
                All ({posts.length})
              </button>
              {collections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={activeId === c.id}
                  className={cx(s.mono, s.chip, s.chipButton, activeId === c.id ? s.chipPaper : s.chipOutline)}
                  onClick={() => setActiveId(c.id)}
                >
                  {c.name} ({c.postIds.length})
                </button>
              ))}
            </div>
          </div>

          {visiblePosts.length === 0 ? (
            <EmptyState size="large" emoji="🏷️" title="Nothing in this collection yet" description="Add a favourite to it from its card’s + button." />
          ) : (
            <PostGrid cols={5}>
              {visiblePosts.map((post) => {
                const creator = creatorById.get(post.creatorId);
                const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle ?? "";
                return (
                  <PostCard
                    key={post.id}
                    href={`/outlier/video/${post.id}`}
                    tile={{ src: post.thumbnailUrl, platform: post.platform, score: formatScore(post.score), scoreAccent: post.score >= 2, height: 280, emoji: "🎬" }}
                    creator={{ initials: creator?.initials ?? "?", handle, avatarUrl: creator?.avatarUrl }}
                    date={post.postedAt}
                    caption={post.caption.split("\n")[0]}
                    views={formatCompact(post.views)}
                    engagement={`${post.engagement.toFixed(1)}%`}
                    hook={post.hookTags[0]}
                    overlay={
                      <div style={{ position: "absolute", right: 8, top: 8, zIndex: 3 }}>
                        <CollectionMenu postId={post.id} collections={collections} trigger="icon" />
                      </div>
                    }
                  />
                );
              })}
            </PostGrid>
          )}
        </>
      )}
    </AppMain>
  );
}
