"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Creator, Platform, Post } from "../data";
import { Avatar, EmptyState, PlatformBadge, ScoreChip, StatRow, Thumb } from "../components";
import { AddCreatorButton, PullHandlesButton } from "../creator-actions";
import { SortDropdown, type SortValue } from "./feed-controls";
import { useToast } from "@/components/ws-toast";

const PLATFORM_LABEL: Record<Platform, string> = { TT: "TikTok", IG: "Instagram", YT: "YouTube" };
const OUTLIER_THRESHOLD = 2;
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

function isFreshlyPulled(post: Post) {
  return Date.now() - new Date(post.createdAtIso).getTime() < NEW_WINDOW_MS;
}

export function FeedGrid({ creators, posts: allPosts }: { creators: Creator[]; posts: Post[] }) {
  const router = useRouter();
  const toast = useToast();
  const [sort, setSort] = useState<SortValue>("score");
  // null = all platforms. A single click on a chip isolates to just that
  // platform; clicking the active one again (or "All") clears it — no
  // dropdown, no multi-select checkboxes to fuss with.
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favouriting, setFavouriting] = useState(false);
  // Outliers-only is the default view — the whole point of this feed is
  // surfacing the posts that broke out, not a chronological dump of
  // everything pulled. Forced back to true (ignoring the user's own choice)
  // when nothing has crossed the bar yet, so a thin-history creator never
  // renders a blank grid with no way to see the posts that exist.
  const [showAll, setShowAll] = useState(false);

  const creatorById = useMemo(() => new Map(creators.map((c) => [c.id, c])), [creators]);
  const above2x = useMemo(() => allPosts.filter((post) => post.score >= OUTLIER_THRESHOLD).length, [allPosts]);
  // Only worth showing the isolate chips at all when there's more than one
  // platform in the watchlist to isolate between.
  const platformsPresent = useMemo(() => [...new Set(allPosts.map((post) => post.platform))], [allPosts]);

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

  const platformFiltered = useMemo(
    () => (platformFilter ? allPosts.filter((post) => post.platform === platformFilter) : allPosts),
    [allPosts, platformFilter]
  );
  const outliersOnly = useMemo(
    () => platformFiltered.filter((post) => post.score >= OUTLIER_THRESHOLD),
    [platformFiltered]
  );
  // Nothing has crossed the bar yet (a thin-history creator, or every
  // platform with an outlier just got filtered out) — fall back to showing
  // everything rather than an empty grid with no way to see what exists.
  const noOutliersYet = platformFiltered.length > 0 && outliersOnly.length === 0;
  const effectiveShowAll = showAll || noOutliersYet;
  const hiddenCount = platformFiltered.length - outliersOnly.length;

  const posts = useMemo(
    () =>
      [...(effectiveShowAll ? platformFiltered : outliersOnly)].sort((a, b) => {
        if (sort === "views") return b.views - a.views;
        if (sort === "newest") return new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime();
        if (sort === "oldest") return new Date(a.postedAtIso).getTime() - new Date(b.postedAtIso).getTime();
        return b.score - a.score;
      }),
    [effectiveShowAll, platformFiltered, outliersOnly, sort]
  );

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            Top outliers
          </h1>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            {noOutliersYet
              ? "No posts have crossed 2× yet — showing everything pulled."
              : `${above2x} posts above 2×`}
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          {!noOutliersYet && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
              style={{ padding: "9px 12px" }}
            >
              {showAll ? "Show outliers only" : `Show all posts · ${hiddenCount}`}
            </button>
          )}
          <SortDropdown current={sort} onChange={setSort} />
          {platformsPresent.length > 1 && (
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                onClick={() => setPlatformFilter(null)}
                className="rounded-[20px] text-[12px] font-medium"
                style={
                  platformFilter === null
                    ? { padding: "6px 12px", background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
                    : { padding: "6px 12px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-60)" }
                }
              >
                All
              </button>
              {platformsPresent.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatformFilter((prev) => (prev === p ? null : p))}
                  className="rounded-[20px] text-[12px] font-medium"
                  style={
                    platformFilter === p
                      ? { padding: "6px 12px", background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
                      : { padding: "6px 12px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-60)" }
                  }
                >
                  {PLATFORM_LABEL[p]}
                </button>
              ))}
            </div>
          )}
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
          <EmptyState size="large" title="No posts match these filters" description="Try a different platform." />
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
                  {selectMode ? (
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
                  ) : (
                    isFreshlyPulled(post) && (
                      <span
                        className="absolute right-[8px] top-[8px] rounded-[5px] font-semibold uppercase"
                        style={{
                          zIndex: 2,
                          fontSize: 9.5,
                          letterSpacing: "0.04em",
                          padding: "3px 6px",
                          background: "var(--ws-accent)",
                          color: "var(--ws-accent-ink)",
                        }}
                      >
                        New
                      </span>
                    )
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
                    <ScoreChip score={post.score} median={post.median} />
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
