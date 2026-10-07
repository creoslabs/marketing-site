"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Creator, Platform, Post } from "../data";
import { formatCompact, formatScore } from "../format";
import { AddCreatorButton, PullHandlesButton } from "../creator-actions";
import { useToast } from "@/components/ws-toast";
import { AppMain, Button, Chip, PageHeader, appStyles as s, cx } from "@/components/app/ui";
import { PostCard, PostGrid } from "@/components/app/media";
import { Switch } from "@/components/app/controls";
import { FilterMenu } from "@/components/app/filter-menu";
import { EmptyState } from "@/components/ws-empty-state";

const OUTLIER_THRESHOLD = 2;
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 20;
const DAY_MS = 86_400_000;
// Module-level so render stays pure (the lint rule flags Date.now() inside a component).
const nowMs = () => Date.now();

type SortValue = "score" | "views" | "newest" | "oldest";
const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: "score", label: "Score" },
  { value: "views", label: "Views" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

type RangeValue = "all" | "7" | "30" | "90";
const RANGE_OPTIONS: Array<{ value: RangeValue; label: string }> = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const PLATFORM_CODE: Record<Platform, string> = { TT: "TikTok", IG: "Instagram", YT: "YouTube" };

function isFreshlyPulled(post: Post) {
  return Date.now() - new Date(post.createdAtIso).getTime() < NEW_WINDOW_MS;
}

// The Feed: every tracked creator's posts, ranked. Filters, sort and the
// outliers-only switch all run client-side on data already loaded, and the
// grid is paginated ("Show 20 more") rather than rendering every post at once.
export function FeedGrid({ creators, posts: allPosts }: { creators: Creator[]; posts: Post[] }) {
  const router = useRouter();
  const toast = useToast();
  const [sort, setSort] = useState<SortValue>("score");
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [hookFilter, setHookFilter] = useState("all");
  const [range, setRange] = useState<RangeValue>("all");
  const [outliersOnly, setOutliersOnly] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favouriting, setFavouriting] = useState(false);

  const creatorById = useMemo(() => new Map(creators.map((c) => [c.id, c])), [creators]);
  const above2x = useMemo(() => allPosts.filter((post) => post.score >= OUTLIER_THRESHOLD).length, [allPosts]);
  const platformsPresent = useMemo(() => [...new Set(allPosts.map((post) => post.platform))], [allPosts]);
  const hookOptions = useMemo(() => {
    const tags = new Map<string, string>();
    for (const p of allPosts) for (const t of p.hookTags) tags.set(t.trim().toLowerCase(), t.trim());
    return [...tags.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [allPosts]);

  const filtered = useMemo(() => {
    const cutoff = range === "all" ? 0 : nowMs() - Number(range) * DAY_MS;
    return allPosts.filter((p) => {
      if (platformFilter && p.platform !== platformFilter) return false;
      if (creatorFilter !== "all" && p.creatorId !== creatorFilter) return false;
      if (hookFilter !== "all" && !p.hookTags.some((t) => t.trim().toLowerCase() === hookFilter)) return false;
      if (cutoff && new Date(p.postedAtIso).getTime() < cutoff) return false;
      return true;
    });
  }, [allPosts, platformFilter, creatorFilter, hookFilter, range]);

  const outliers = useMemo(() => filtered.filter((p) => p.score >= OUTLIER_THRESHOLD), [filtered]);
  // Nothing has crossed the bar in this view — show everything rather than
  // an empty grid with no way to see what exists.
  const noOutliersYet = filtered.length > 0 && outliers.length === 0;
  const effectiveOutliersOnly = outliersOnly && !noOutliersYet;

  const ranked = useMemo(
    () =>
      [...(effectiveOutliersOnly ? outliers : filtered)].sort((a, b) => {
        if (sort === "views") return b.views - a.views;
        if (sort === "newest") return new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime();
        if (sort === "oldest") return new Date(a.postedAtIso).getTime() - new Date(b.postedAtIso).getTime();
        return b.score - a.score;
      }),
    [effectiveOutliersOnly, outliers, filtered, sort]
  );
  const shown = ranked.slice(0, visible);

  function resetPaging<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setVisible(PAGE_SIZE);
    };
  }

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
    // A favourite is a single cheap row write, not an external API call, so
    // there's no rate-limit reason to do these one at a time.
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`/api/outlier/posts/${id}/favourite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favourited: true }),
        }).then((res) => res.ok)
      )
    );
    const successCount = results.filter(Boolean).length;
    setFavouriting(false);
    if (successCount > 0) toast(`Favourited ${successCount} post${successCount === 1 ? "" : "s"}.`, "success");
    if (successCount < ids.length) toast(`${ids.length - successCount} couldn't be favourited.`, "error");
    setSelectMode(false);
    setSelectedIds(new Set());
    router.refresh();
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label.toLowerCase() ?? "score";

  return (
    <AppMain>
      <PageHeader
        eyebrow="02 / Feed"
        line1="Top outliers."
        sub={
          noOutliersYet
            ? "No posts have crossed 2× yet — showing everything pulled."
            : `${above2x} post${above2x === 1 ? "" : "s"} above 2× across ${creators.length} creator${creators.length === 1 ? "" : "s"}, ranked by ${sortLabel}.`
        }
        actions={
          <>
            {allPosts.length > 0 && (
              <Button variant="ghost" onClick={toggleSelectMode}>
                {selectMode ? "Cancel" : "Select"}
              </Button>
            )}
            <AddCreatorButton variant="primary" />
          </>
        }
      />

      {allPosts.length > 0 && (
        <div className={s.toolbar}>
          {platformsPresent.length > 1 && (
            <>
              <div style={{ display: "flex", gap: 6 }} role="group" aria-label="Platform">
                <button
                  type="button"
                  aria-pressed={platformFilter === null}
                  className={cx(s.mono, s.chip, s.chipButton, platformFilter === null ? s.chipPaper : s.chipOutline)}
                  onClick={() => resetPaging(setPlatformFilter)(null)}
                >
                  All
                </button>
                {platformsPresent.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={platformFilter === p}
                    className={cx(s.mono, s.chip, s.chipButton, platformFilter === p ? s.chipPaper : s.chipOutline)}
                    onClick={() => resetPaging(setPlatformFilter)(platformFilter === p ? null : p)}
                  >
                    {PLATFORM_CODE[p]}
                  </button>
                ))}
              </div>
              <span className={s.toolbarDivider} />
            </>
          )}
          <FilterMenu
            label="Creator"
            value={creatorFilter}
            onChange={resetPaging(setCreatorFilter)}
            options={[{ value: "all", label: "All creators" }, ...creators.map((c) => ({ value: c.id, label: c.displayName }))]}
          />
          <FilterMenu
            label="Hook style"
            value={hookFilter}
            onChange={resetPaging(setHookFilter)}
            options={[{ value: "all", label: "Any hook style" }, ...hookOptions.map(([key, label]) => ({ value: key, label }))]}
          />
          <FilterMenu label="Date range" value={range} onChange={resetPaging(setRange)} options={RANGE_OPTIONS} />
          <span className={s.toolbarRight}>
            <span className={s.toolbarNote}>Score ≥ 2× only</span>
            <Switch checked={effectiveOutliersOnly} onChange={resetPaging(setOutliersOnly)} label="Score at least 2x only" disabled={noOutliersYet} />
            <FilterMenu label="Sort" prefix="Sort: " value={sort} onChange={resetPaging(setSort)} options={SORT_OPTIONS} align="right" />
          </span>
        </div>
      )}

      {allPosts.length === 0 ? (
        <EmptyState
          size="large"
          emoji="📭"
          title={creators.length === 0 ? "Nothing to show yet" : "No posts pulled yet"}
          description={
            creators.length === 0
              ? "Add a creator to your watchlist to start seeing their posts ranked here."
              : "Your watchlist is set up — pull now to start scoring posts against each creator's own median."
          }
          action={
            creators.length === 0 ? (
              <AddCreatorButton variant="primary" />
            ) : (
              <PullHandlesButton handles={creators.flatMap((c) => c.handles)} icon="refresh" />
            )
          }
        />
      ) : ranked.length === 0 ? (
        <EmptyState size="large" emoji="🔍" title="No posts match these filters" description="Try a different creator, hook style or date range." />
      ) : (
        <>
          <PostGrid cols={5}>
            {shown.map((post, i) => {
              const creator = creatorById.get(post.creatorId);
              const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle ?? "";
              return (
                <PostCard
                  key={post.id}
                  href={`/outlier/video/${post.id}`}
                  ring={i === 0 && sort === "score" && !selectMode}
                  tile={{
                    src: post.thumbnailUrl,
                    platform: post.platform,
                    score: formatScore(post.score),
                    scoreAccent: post.score >= OUTLIER_THRESHOLD,
                    height: 280,
                    emoji: "🎬",
                    label: post.thin ? <span style={{ color: "var(--ws-warn)" }}>Thin history</span> : isFreshlyPulled(post) ? "New" : undefined,
                  }}
                  creator={{ initials: creator?.initials ?? "?", handle, avatarUrl: creator?.avatarUrl }}
                  date={post.postedAt}
                  caption={post.caption.split("\n")[0]}
                  views={formatCompact(post.views)}
                  engagement={`${post.engagement.toFixed(1)}%`}
                  hook={post.hookTags[0]}
                  selectMode={selectMode}
                  selected={selectedIds.has(post.id)}
                  onToggle={() => toggleSelected(post.id)}
                />
              );
            })}
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
            {!effectiveOutliersOnly && !noOutliersYet && outliers.length < filtered.length && <Chip variant="soft">Including posts under 2×</Chip>}
          </div>
        </>
      )}

      {selectMode && selectedIds.size > 0 && (
        <div className={s.floatBar} role="status">
          <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedIds.size} selected</span>
          <Button variant="primary" size="sm" onClick={favouriteSelected} disabled={favouriting}>
            {favouriting ? "Favouriting…" : "☆ Favourite all"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}
    </AppMain>
  );
}
