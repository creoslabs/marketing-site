"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Creator, Platform, Post } from "../data";
import { Avatar, EmptyState, PlatformBadge, ScoreChip, StatRow, Thumb } from "../components";
import { AddCreatorButton, PullHandlesButton } from "../creator-actions";
import { SortDropdown, PlatformFilter, type SortValue } from "./feed-controls";
import { useToast } from "@/components/ws-toast";

const ALL_PLATFORMS: Platform[] = ["TT", "IG", "YT"];

export function FeedGrid({ creators, posts: allPosts }: { creators: Creator[]; posts: Post[] }) {
  const router = useRouter();
  const toast = useToast();
  const [sort, setSort] = useState<SortValue>("score");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(ALL_PLATFORMS);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favouriting, setFavouriting] = useState(false);

  const creatorById = useMemo(() => new Map(creators.map((c) => [c.id, c])), [creators]);
  const above2x = useMemo(() => allPosts.filter((post) => post.score >= 2).length, [allPosts]);

  function toggleSelectMode() {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function favouriteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setFavouriting(true);
    let successCount = 0;
    for (const id of ids) {
      const res = await fetch(`/api/outlier/posts/${id}/favourite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favourited: true }),
      });
      if (res.ok) successCount += 1;
    }
    setFavouriting(false);
    if (successCount > 0) {
      toast(`Favourited ${successCount} post${successCount === 1 ? "" : "s"}.`, "success");
    }
    if (successCount < ids.length) {
      toast(`${ids.length - successCount} couldn't be favourited.`, "error");
    }
    setSelectMode(false);
    setSelectedIds(new Set());
    router.refresh();
  }

  const posts = useMemo(
    () =>
      allPosts
        .filter((post) => selectedPlatforms.includes(post.platform))
        .sort((a, b) => {
          if (sort === "views") return b.views - a.views;
          if (sort === "newest") return new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime();
          if (sort === "oldest") return new Date(a.postedAtIso).getTime() - new Date(b.postedAtIso).getTime();
          return b.score - a.score;
        }),
    [allPosts, selectedPlatforms, sort]
  );

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            Top outliers
          </h1>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            {above2x} posts above 2×
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <SortDropdown current={sort} onChange={setSort} />
          <PlatformFilter selected={selectedPlatforms} onChange={setSelectedPlatforms} />
          {allPosts.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectMode}
              className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
              style={{ padding: "9px 12px" }}
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
          )}
          <AddCreatorButton className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "9px 12px" }}>
            + Add creator
          </AddCreatorButton>
        </div>
      </div>

      {allPosts.length === 0 ? (
        <div className="mt-[18px]">
          <EmptyState
            size="large"
            title={creators.length === 0 ? "Nothing to show yet" : "No posts pulled yet"}
            description={
              creators.length === 0
                ? "Add a creator to your watchlist to start seeing their posts ranked here."
                : "Your watchlist is set up — pull now to start scoring posts against each creator's own median."
            }
            action={
              creators.length === 0 ? (
                <AddCreatorButton className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "10px 14px" }}>
                  + Add creator
                </AddCreatorButton>
              ) : (
                <PullHandlesButton handles={creators.flatMap((c) => c.handles)} />
              )
            }
          />
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-[18px]">
          <EmptyState size="large" title="No posts match these filters" description="Try enabling more platforms." />
        </div>
      ) : (
        <div className="mt-[18px] grid grid-cols-2 gap-[18px] sm:grid-cols-3 lg:grid-cols-5">
          {posts.map((post) => {
            const creator = creatorById.get(post.creatorId);
            const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle;
            const isSelected = selectedIds.has(post.id);
            return (
              <Link
                key={post.id}
                href={`/outlier/video/${post.id}`}
                className="block"
                onClick={(e) => {
                  if (selectMode) {
                    e.preventDefault();
                    toggleSelected(post.id);
                  }
                }}
              >
                <Thumb aspectRatio="9/13" radius={11}>
                  {post.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- a scraped CDN URL, not a static asset next/image can optimize
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {selectMode && (
                    <div
                      className="absolute right-[8px] top-[8px] flex h-[20px] w-[20px] items-center justify-center rounded-[5px] text-[12px]"
                      style={
                        isSelected
                          ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)", zIndex: 2 }
                          : { border: "1.5px solid rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.3)", zIndex: 2 }
                      }
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                  )}
                  <div className="absolute left-[8px] top-[8px]" style={{ zIndex: 2 }}>
                    <PlatformBadge platform={post.platform} />
                  </div>
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      height: 52,
                      background:
                        "linear-gradient(to top, color-mix(in srgb, var(--ws-ground) 70%, transparent), transparent)",
                    }}
                  />
                  <div className="absolute bottom-[8px] left-[8px]" style={{ zIndex: 2 }}>
                    <ScoreChip score={post.score} />
                  </div>
                </Thumb>

                <div className="mt-[8px] flex items-center gap-[7px]">
                  {creator && <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={26} />}
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {handle}
                    </p>
                    <p className="truncate text-[11px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
                      {post.postedAt}
                    </p>
                  </div>
                </div>
                <div className="mt-[7px]">
                  <StatRow views={post.views} engagement={post.engagement} />
                </div>
                <p
                  className="mt-[6px] text-[11.5px] leading-[1.4]"
                  style={{ color: "var(--ws-ink-60)", textWrap: "pretty" as React.CSSProperties["textWrap"] }}
                >
                  {post.caption.split("\n")[0]}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {selectMode && selectedIds.size > 0 && (
        <div
          className="ws-card fixed left-1/2 flex items-center gap-[14px]"
          style={{ padding: "12px 18px", transform: "translateX(-50%)", bottom: 24, zIndex: 100 }}
        >
          <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            onClick={favouriteSelected}
            disabled={favouriting}
            className="ws-btn-primary rounded-[7px] text-[12.5px] font-semibold"
            style={{ padding: "8px 14px", opacity: favouriting ? 0.6 : 1 }}
          >
            {favouriting ? "Favouriting…" : "☆ Favourite all"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium"
            style={{ padding: "8px 14px" }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
