import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedUserId } from "@/lib/supabase/data";
import { outlierTag } from "@/lib/outlier/cache";
import { relativeTime } from "@/lib/relative-time";
import type {
  Creator,
  Post,
  Job,
  Platform,
  TranscriptLine,
  Beat,
  CreatorPatterns,
  TagCount,
  RepurposeSummary,
  RepurposeDetail,
  Collection,
} from "./data";

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && /^https?:\/\//.test(url));
}

// Matches SETTINGS.thinHistoryFloor previously in data.ts.
const THIN_HISTORY_FLOOR = 12;

function medianOf(nums: number[]) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (date.getFullYear() !== new Date().getFullYear()) options.year = "numeric";
  return date.toLocaleDateString("en-US", options);
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function computeCadence(postedAtIso: string[]): string {
  if (postedAtIso.length < 2) return "—";
  const times = postedAtIso.map((d) => new Date(d).getTime()).sort((a, b) => a - b);
  const spanDays = (times[times.length - 1] - times[0]) / 86_400_000;
  if (spanDays < 1) return `${postedAtIso.length}/day`;
  const perWeek = postedAtIso.length / (spanDays / 7);
  return `${perWeek.toFixed(1)}/week`;
}

// Rolls up hook style and beat structure across a creator's already-
// analyzed posts. Tags are free-text per analysis (Claude names them fresh
// each time rather than picking from a fixed taxonomy), so this groups by
// trimmed/lowercased text — an honest count of literal reuse, not a
// semantic clustering of near-synonyms.
function computePatterns(rows: PostRow[]): CreatorPatterns {
  const analyzed = rows.filter((r) => r.analysis_status === "done");

  function rank(counts: Map<string, TagCount>): TagCount[] {
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }

  const hookTagCounts = new Map<string, TagCount>();
  const beatNameCounts = new Map<string, TagCount>();
  for (const row of analyzed) {
    for (const rawTag of row.hook_tags ?? []) {
      const key = rawTag.trim().toLowerCase();
      if (!key) continue;
      const existing = hookTagCounts.get(key);
      if (existing) existing.count += 1;
      else hookTagCounts.set(key, { label: rawTag.trim(), count: 1 });
    }
    for (const beat of row.beats ?? []) {
      const key = beat.name.trim().toLowerCase();
      if (!key) continue;
      const existing = beatNameCounts.get(key);
      if (existing) existing.count += 1;
      else beatNameCounts.set(key, { label: beat.name.trim(), count: 1 });
    }
  }

  return { analyzedCount: analyzed.length, hookTags: rank(hookTagCounts), beatNames: rank(beatNameCounts) };
}

function computeMedianTrend(viewsMostRecentFirst: number[]): number | null {
  if (viewsMostRecentFirst.length < 6) return null;
  const half = Math.floor(viewsMostRecentFirst.length / 2);
  const recentMedian = medianOf(viewsMostRecentFirst.slice(0, half));
  const olderMedian = medianOf(viewsMostRecentFirst.slice(half));
  if (olderMedian === 0) return null;
  return Math.round(((recentMedian - olderMedian) / olderMedian) * 100);
}

type CreatorRow = { id: string; display_name: string | null; notes: string | null };
type HandleRow = {
  id: string;
  creator_id: string;
  platform: Platform;
  handle: string;
  status: "active" | "pulling" | "error";
  error: string | null;
  last_pulled_at: string | null;
  avatar_url: string | null;
};

type PostRow = {
  id: string;
  handle_id: string;
  platform: Platform;
  caption: string | null;
  url: string;
  video_url: string | null;
  thumbnail_url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number | null;
  followers: number | null;
  duration_seconds: number | null;
  posted_at: string;
  analysis_status: "none" | "analyzing" | "done" | "failed";
  analysis_error: string | null;
  // Not loaded for list views (see POST_LIST_COLUMNS); only the detail page selects it.
  transcript?: TranscriptLine[] | null;
  beats: Beat[] | null;
  hook_tags: string[] | null;
  favourited: boolean;
  created_at: string;
};

// Everything the list pages (Home, Feed, Trends, Creators…) need — notably
// without the transcript, which is large and only the post page shows.
const POST_LIST_COLUMNS =
  "id, handle_id, platform, caption, url, video_url, thumbnail_url, views, likes, comments, shares, saves, followers, duration_seconds, posted_at, analysis_status, analysis_error, beats, hook_tags, favourited, created_at";

function buildCreator(row: CreatorRow, handles: HandleRow[], postsByHandle: Map<string, StatRow[]>): Creator {
  const allPosts = handles.flatMap((h) => postsByHandle.get(h.id) ?? []);
  const views = allPosts.map((p) => p.views);
  const median = medianOf(views);
  const scores = median > 0 ? views.map((v) => v / median) : [];
  const sortedDesc = [...allPosts].sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());

  const name = row.display_name ?? handles[0]?.handle ?? "Unknown";
  const initials = name.replace(/^@/, "").slice(0, 2).toUpperCase();
  const avatarUrl = handles.find((h) => h.avatar_url)?.avatar_url ?? null;

  const postsByPlatform = new Map<Platform, StatRow[]>();
  for (const post of allPosts) {
    postsByPlatform.set(post.platform, [...(postsByPlatform.get(post.platform) ?? []), post]);
  }
  const platformStats = [...postsByPlatform.entries()].map(([platform, platPosts]) => {
    const platViews = platPosts.map((p) => p.views);
    const platMedian = medianOf(platViews);
    const platScores = platMedian > 0 ? platViews.map((v) => v / platMedian) : [];
    return { platform, median: platMedian, bestScore: platScores.length > 0 ? Math.max(...platScores) : 0, postCount: platPosts.length };
  });

  return {
    id: row.id,
    displayName: name,
    initials,
    avatarUrl,
    handles: handles.map((h) => {
      const handlePosts = postsByHandle.get(h.id) ?? [];
      return {
        id: h.id,
        platform: h.platform,
        handle: h.handle,
        postCount: handlePosts.length,
        thin: handlePosts.length < THIN_HISTORY_FLOOR,
      };
    }),
    median,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    hitsAbove2x: scores.filter((s) => s >= 2).length,
    cadence: computeCadence(allPosts.map((p) => p.posted_at)),
    medianTrend: computeMedianTrend(sortedDesc.map((p) => p.views)),
    spark: sortedDesc.slice(0, 10).map((p) => p.views).reverse(),
    platformStats,
    notes: row.notes,
  };
}

function buildPost(row: PostRow, creatorId: string, creatorMedian: number, thin: boolean): Post {
  const likes = row.likes;
  const comments = row.comments;
  const shares = row.shares;
  const saves = row.saves ?? 0;
  const engagement = row.views > 0 ? ((likes + comments + shares + saves) / row.views) * 100 : 0;
  return {
    id: row.id,
    creatorId,
    platform: row.platform,
    caption: row.caption ?? "",
    description: "",
    thumbnailUrl: row.thumbnail_url,
    views: row.views,
    median: creatorMedian,
    score: creatorMedian > 0 ? row.views / creatorMedian : 0,
    postedAt: formatDate(row.posted_at),
    postedAtIso: row.posted_at,
    createdAtIso: row.created_at,
    duration: row.duration_seconds != null ? formatDuration(row.duration_seconds) : "",
    likes,
    comments,
    shares,
    saves,
    engagement,
    followers: row.followers ?? 0,
    thin,
    favourite: row.favourited,
    analysisStatus: row.analysis_status,
    hookTags: row.hook_tags ?? [],
  };
}

// ---------------------------------------------------------------------------
// Data loading.
//
// Every list page used to download every post (all columns) and score them
// in code. Now there are two tiers:
//   1. A light pass — only the few columns needed to rank and score every
//      post (views, dates, tags). It's small, cached per user for 30 s, and
//      powers creators, medians, scores, counts, hook patterns.
//   2. Full "card" rows, fetched only for the posts a page really shows.
// A creator page loads just that creator's posts.
// ---------------------------------------------------------------------------

type LightPostRow = Pick<PostRow, "id" | "handle_id" | "platform" | "views" | "posted_at" | "created_at" | "analysis_status" | "hook_tags" | "favourited">;
type StatRow = Pick<PostRow, "views" | "posted_at" | "platform">;
type LightData = { creatorRows: CreatorRow[]; handleRows: HandleRow[]; postRows: LightPostRow[] };

const LIGHT_COLUMNS = "id, handle_id, platform, views, posted_at, created_at, analysis_status, hook_tags, favourited";
const CARD_COLUMNS =
  "id, handle_id, platform, caption, thumbnail_url, views, likes, comments, shares, saves, followers, duration_seconds, posted_at, created_at, analysis_status, hook_tags, favourited";
const CREATOR_COLUMNS = "id, display_name, notes";
const HANDLE_COLUMNS = "id, creator_id, platform, handle, status, error, last_pulled_at, avatar_url";
const LIGHT_TTL_SECONDS = 30;
const ID_CHUNK = 120;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this project doesn't generate a Database type for the Supabase client.
type Db = SupabaseClient<any>;

// PostgREST caps a response at 1,000 rows, so page through until done —
// previously a big watchlist was silently cut off at 1,000 posts.
async function fetchLightPosts(db: Db, handleIds: string[]): Promise<LightPostRow[]> {
  const PAGE = 1000;
  const out: LightPostRow[] = [];
  for (let page = 0; page < 30; page++) {
    const { data } = await db
      .from("outlier_posts")
      .select(LIGHT_COLUMNS)
      .in("handle_id", handleIds)
      .order("posted_at", { ascending: false })
      .order("id")
      .range(page * PAGE, page * PAGE + PAGE - 1)
      .returns<LightPostRow[]>();
    out.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE) break;
  }
  return out;
}

// `userId` is set when reading with the service-role client (cache path) —
// every query is then scoped to that user by hand, standing in for RLS. With
// the cookie-bound client RLS does the scoping and userId is null.
async function fetchLightData(db: Db, userId: string | null): Promise<LightData> {
  // outlier_handles carries its own user_id, so it can be fetched alongside
  // creators instead of after them.
  let creatorsQ = db.from("outlier_creators").select(CREATOR_COLUMNS).order("created_at", { ascending: false });
  let handlesQ = db.from("outlier_handles").select(HANDLE_COLUMNS);
  if (userId) {
    creatorsQ = creatorsQ.eq("user_id", userId);
    handlesQ = handlesQ.eq("user_id", userId);
  }
  const [{ data: creatorRows }, { data: handleRows }] = await Promise.all([creatorsQ.returns<CreatorRow[]>(), handlesQ.returns<HandleRow[]>()]);
  const handles = handleRows ?? [];
  if (!creatorRows || creatorRows.length === 0 || handles.length === 0) return { creatorRows: creatorRows ?? [], handleRows: handles, postRows: [] };
  const postRows = await fetchLightPosts(db, handles.map((h) => h.id));
  return { creatorRows, handleRows: handles, postRows };
}

function readLightCached(userId: string): Promise<LightData> {
  return unstable_cache(() => fetchLightData(createAdminClient(), userId), ["outlier-light-v1", userId], {
    revalidate: LIGHT_TTL_SECONDS,
    tags: [outlierTag(userId)],
  })();
}

function canUseSharedCache() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

type PostMeta = { row: LightPostRow; creatorId: string; creatorMedian: number; thin: boolean; score: number };

const loadLight = cache(async () => {
  const empty = { creators: [] as Creator[], handlesByCreator: new Map<string, HandleRow[]>(), metas: [] as PostMeta[], metaById: new Map<string, PostMeta>() };
  if (!isSupabaseConfigured()) return empty;

  // Shared 30 s cache keyed on the proxy-verified user id; falls back to a
  // direct (RLS-scoped) read whenever that isn't available.
  const userId = canUseSharedCache() ? await getVerifiedUserId() : null;
  let data: LightData | null = null;
  if (userId) {
    try {
      data = await readLightCached(userId);
    } catch {
      data = null;
    }
  }
  if (!data) data = await fetchLightData(await createClient(), null);
  if (data.creatorRows.length === 0) return empty;

  const handlesByCreator = new Map<string, HandleRow[]>();
  for (const h of data.handleRows) handlesByCreator.set(h.creator_id, [...(handlesByCreator.get(h.creator_id) ?? []), h]);
  const postsByHandle = new Map<string, LightPostRow[]>();
  for (const p of data.postRows) postsByHandle.set(p.handle_id, [...(postsByHandle.get(p.handle_id) ?? []), p]);

  const creators = data.creatorRows
    .map((row) => buildCreator(row, handlesByCreator.get(row.id) ?? [], postsByHandle))
    .filter((c) => c.handles.length > 0); // a creator that just lost its last handle shouldn't linger

  const metas: PostMeta[] = [];
  for (const creator of creators) {
    const thin = creator.handles.every((h) => h.thin);
    for (const handle of handlesByCreator.get(creator.id) ?? []) {
      for (const row of postsByHandle.get(handle.id) ?? []) {
        metas.push({ row, creatorId: creator.id, creatorMedian: creator.median, thin, score: creator.median > 0 ? row.views / creator.median : 0 });
      }
    }
  }
  metas.sort((a, b) => b.score - a.score);
  return { creators, handlesByCreator, metas, metaById: new Map(metas.map((m) => [m.row.id, m])) };
});

export const getCreators = cache(async (): Promise<Creator[]> => (await loadLight()).creators);

// Full card rows for specific posts, fetched in parallel chunks (a long
// id list would overflow the request URL).
async function fetchCards(ids: string[]): Promise<Map<string, PostRow>> {
  const out = new Map<string, PostRow>();
  if (ids.length === 0) return out;
  const supabase = await createClient();
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += ID_CHUNK) chunks.push(ids.slice(i, i + ID_CHUNK));
  const results = await Promise.all(chunks.map((chunk) => supabase.from("outlier_posts").select(CARD_COLUMNS).in("id", chunk).returns<PostRow[]>()));
  for (const { data } of results) for (const row of data ?? []) out.set(row.id, row);
  return out;
}

// Posts for a set of metas, highest score first.
async function postsFor(metas: PostMeta[]): Promise<Post[]> {
  const cards = await fetchCards(metas.map((m) => m.row.id));
  const posts: Post[] = [];
  for (const meta of metas) {
    const row = cards.get(meta.row.id);
    if (row) posts.push(buildPost(row, meta.creatorId, meta.creatorMedian, meta.thin));
  }
  return posts.sort((a, b) => b.score - a.score);
}

export type PostSummary = { total: number; outlierCount: number; anyAnalyzed: boolean; bestScore: number; bestPostId: string | null };

// Counts and headline numbers for Home/Workspace without loading any post.
export const getPostSummary = cache(async (): Promise<PostSummary> => {
  const { metas } = await loadLight();
  return {
    total: metas.length,
    outlierCount: metas.filter((m) => m.score >= 2).length,
    anyAnalyzed: metas.some((m) => m.row.analysis_status === "done"),
    bestScore: metas[0]?.score ?? 0,
    bestPostId: metas[0]?.row.id ?? null,
  };
});

// The n highest-scoring posts across the watchlist.
export const getTopPosts = cache(async (n: number): Promise<Post[]> => {
  const { metas } = await loadLight();
  return postsFor(metas.slice(0, n));
});

// Every post across the watchlist, ranked — only for the Feed's "show
// everything" view; ordinary pages never need this.
export const getAllPosts = cache(async (): Promise<Post[]> => {
  const { metas } = await loadLight();
  return postsFor(metas);
});

const FEED_INITIAL_CAP = 300;

export type FeedData = {
  creators: Creator[];
  posts: Post[];
  total: number;
  outlierCount: number;
  // Everything the filters offer, computed from the light pass so they're
  // complete even though only some posts are loaded.
  platforms: Platform[];
  hookOptions: [string, string][];
  loadedAll: boolean;
};

// What the Feed opens with: just the outliers (score ≥ 2×) — the view it
// defaults to — or, if nothing has crossed the bar yet, the top posts. The
// rest loads on demand when someone turns the outliers-only filter off.
export const getFeedData = cache(async (): Promise<FeedData> => {
  const { creators, metas } = await loadLight();
  const outliers = metas.filter((m) => m.score >= 2);
  const initial = (outliers.length > 0 ? outliers : metas).slice(0, FEED_INITIAL_CAP);
  const tags = new Map<string, string>();
  for (const m of metas) for (const t of m.row.hook_tags ?? []) tags.set(t.trim().toLowerCase(), t.trim());
  return {
    creators,
    posts: await postsFor(initial),
    total: metas.length,
    outlierCount: outliers.length,
    platforms: [...new Set(metas.map((m) => m.row.platform))],
    hookOptions: [...tags.entries()].sort((a, b) => a[1].localeCompare(b[1])),
    loadedAll: initial.length === metas.length,
  };
});

// Favourited posts across the whole watchlist, for the Favourites page.
export const getFavouritePosts = cache(async (): Promise<Post[]> => {
  const { metas } = await loadLight();
  return postsFor(metas.filter((m) => m.row.favourited));
});

// Every post across the whole watchlist sharing a hook tag, ranked by
// score — the "click a tag, see everyone else doing this" view. Same
// trimmed/lowercased exact-match convention as computePatterns() above, so
// a click from either the creator page's ranked list or a post's own tag
// pills lands on the same set.
export const getPostsByHookTag = cache(async (tag: string): Promise<Post[]> => {
  const key = tag.trim().toLowerCase();
  if (!key) return [];
  const { metas } = await loadLight();
  return postsFor(metas.filter((m) => (m.row.hook_tags ?? []).some((t) => t.trim().toLowerCase() === key)));
});

export type HookStylePattern = {
  tag: string;
  avgScore: number;
  postCount: number;
  creatorCount: number;
};

// Cross-creator hook-tag performance — the only real "what's working
// regardless of topic" signal the data supports today (there's no topic/theme
// field to cluster captions by, so this covers just the hook-style half of
// the Trends page). A tag only counts once it's shared by at least two
// creators, matching the "topic-agnostic" framing: one creator doing well
// with a style tells you nothing about whether the style itself works.
export const getHookStylePatterns = cache(async (): Promise<HookStylePattern[]> => {
  const { metas } = await loadLight();
  const byTag = new Map<string, { label: string; scores: number[]; creatorIds: Set<string> }>();
  for (const m of metas) {
    if (m.row.analysis_status !== "done" || m.thin) continue;
    for (const rawTag of m.row.hook_tags ?? []) {
      const label = rawTag.trim();
      if (!label) continue;
      const key = label.toLowerCase();
      const entry = byTag.get(key) ?? { label, scores: [], creatorIds: new Set() };
      entry.scores.push(m.score);
      entry.creatorIds.add(m.creatorId);
      byTag.set(key, entry);
    }
  }
  return Array.from(byTag.values())
    .filter((entry) => entry.creatorIds.size >= 2)
    .map((entry) => ({
      tag: entry.label,
      avgScore: entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length,
      postCount: entry.scores.length,
      creatorCount: entry.creatorIds.size,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
});

// One creator with all of its posts. Loads only this creator's rows rather
// than the whole watchlist.
export const getCreatorDetail = cache(
  async (id: string): Promise<{ creator: Creator; posts: Post[]; patterns: CreatorPatterns } | null> => {
    if (!isSupabaseConfigured()) return null;
    const supabase = await createClient();
    const [{ data: creatorRow }, { data: handleRows }] = await Promise.all([
      supabase.from("outlier_creators").select(CREATOR_COLUMNS).eq("id", id).maybeSingle<CreatorRow>(),
      supabase.from("outlier_handles").select(HANDLE_COLUMNS).eq("creator_id", id).returns<HandleRow[]>(),
    ]);
    const handles = handleRows ?? [];
    if (!creatorRow || handles.length === 0) return null;

    const rows: PostRow[] = [];
    for (let page = 0; page < 30; page++) {
      const { data } = await supabase
        .from("outlier_posts")
        .select(POST_LIST_COLUMNS)
        .in("handle_id", handles.map((h) => h.id))
        .order("posted_at", { ascending: false })
        .order("id")
        .range(page * 1000, page * 1000 + 999)
        .returns<PostRow[]>();
      rows.push(...(data ?? []));
      if ((data?.length ?? 0) < 1000) break;
    }

    const postsByHandle = new Map<string, PostRow[]>();
    for (const post of rows) postsByHandle.set(post.handle_id, [...(postsByHandle.get(post.handle_id) ?? []), post]);
    const creator = buildCreator(creatorRow, handles, postsByHandle);
    const overallThin = creator.handles.every((h) => h.thin);
    const posts = rows
      .map((row) => buildPost(row, id, creator.median, overallThin))
      .sort((a, b) => new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime());
    return { creator, posts, patterns: computePatterns(rows) };
  }
);

export const getPostDetail = cache(
  async (id: string): Promise<{ post: Post; creator: Creator; rank: number; outOf: number; row: PostRow } | null> => {
    if (!isSupabaseConfigured()) return null;

    const supabase = await createClient();
    const { data: row } = await supabase.from("outlier_posts").select("*").eq("id", id).maybeSingle<PostRow>();
    if (!row) return null;

    const { data: handleRow } = await supabase
      .from("outlier_handles")
      .select("creator_id")
      .eq("id", row.handle_id)
      .maybeSingle<{ creator_id: string }>();
    if (!handleRow) return null;

    const detail = await getCreatorDetail(handleRow.creator_id);
    if (!detail) return null;

    const sorted = [...detail.posts].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((p) => p.id === id) + 1;
    const post = detail.posts.find((p) => p.id === id);
    if (!post) return null;

    return { post, creator: detail.creator, rank, outOf: detail.posts.length, row };
  }
);

type JobRow = {
  id: string;
  handle_id: string;
  state: "queued" | "running" | "done" | "failed";
  stage: string | null;
  new_posts_count: number | null;
  error: string | null;
  created_at: string;
  finished_at: string | null;
};

// Raw job + handle rows. Cached briefly per user (it runs in the layout on
// every navigation) and cleared by revalidateOutlier() when a pull starts
// or finishes, so the running count stays live.
async function fetchJobData(db: Db, userId: string | null): Promise<{ rows: JobRow[]; handleRows: { id: string; creator_id: string; platform: Platform; handle: string }[] }> {
  let jobsQ = db.from("outlier_jobs").select("*").order("created_at", { ascending: false }).limit(30);
  if (userId) jobsQ = jobsQ.eq("user_id", userId);
  const { data } = await jobsQ.returns<JobRow[]>();
  const rows = data ?? [];
  if (rows.length === 0) return { rows, handleRows: [] };
  const { data: handleRows } = await db
    .from("outlier_handles")
    .select("id, creator_id, platform, handle")
    .in(
      "id",
      rows.map((r) => r.handle_id)
    )
    .returns<{ id: string; creator_id: string; platform: Platform; handle: string }[]>();
  return { rows, handleRows: handleRows ?? [] };
}

export const getJobs = cache(
  async (): Promise<{
    jobs: Job[];
    finished: { creatorId: string; handle: string; newPostsCount: number; label: string; relativeTime: string; finishedAtIso: string }[];
  }> => {
    if (!isSupabaseConfigured()) return { jobs: [], finished: [] };

    const userId = canUseSharedCache() ? await getVerifiedUserId() : null;
    let raw: Awaited<ReturnType<typeof fetchJobData>> | null = null;
    if (userId) {
      try {
        raw = await unstable_cache(() => fetchJobData(createAdminClient(), userId), ["outlier-jobs-v1", userId], {
          revalidate: 15,
          tags: [outlierTag(userId)],
        })();
      } catch {
        raw = null;
      }
    }
    if (!raw) raw = await fetchJobData(await createClient(), null);
    const { rows, handleRows } = raw;
    if (rows.length === 0) return { jobs: [], finished: [] };
    const handleById = new Map(handleRows.map((h) => [h.id, h]));

    const jobs: Job[] = rows
      .filter((r) => r.state === "queued" || r.state === "running" || r.state === "failed")
      .map((r) => {
        const h = handleById.get(r.handle_id);
        return {
          id: r.id,
          handleId: r.handle_id,
          creatorId: h?.creator_id ?? "",
          handle: h?.handle ?? "",
          platform: h?.platform ?? "TT",
          scope: "Pull",
          stage: r.stage ?? (r.state === "running" ? "Pulling posts…" : r.state === "failed" ? "Failed" : "Queued"),
          pct: r.state === "running" ? 50 : 0,
          eta: "",
          state: r.state,
          error: r.error ?? undefined,
          atIso: r.created_at,
        };
      });

    const finished = rows
      .filter((r) => r.state === "done")
      .slice(0, 10)
      .map((r) => {
        const h = handleById.get(r.handle_id);
        return {
          creatorId: h?.creator_id ?? "",
          handle: h?.handle ?? "?",
          newPostsCount: r.new_posts_count ?? 0,
          label: `Pulled ${r.new_posts_count ?? 0} new post${r.new_posts_count === 1 ? "" : "s"} for @${h?.handle ?? "?"}`,
          relativeTime: relativeTime(r.finished_at ?? r.created_at),
          finishedAtIso: r.finished_at ?? r.created_at,
        };
      });

    return { jobs, finished };
  }
);

type RepurposeRow = {
  id: string;
  post_id: string;
  creator_id: string;
  topic: string;
  source_score: number;
  title: string;
  hook: string;
  beats: { name: string; script: string }[];
  created_at: string;
  is_public: boolean;
};

const REPURPOSE_COLUMNS = "id, post_id, creator_id, topic, source_score, title, hook, beats, created_at, is_public";

function toRepurposeSummary(row: RepurposeRow): RepurposeSummary {
  return {
    id: row.id,
    postId: row.post_id,
    creatorId: row.creator_id,
    title: row.title,
    sourceScore: row.source_score,
    createdAtIso: row.created_at,
    isPublic: row.is_public,
  };
}

// Most recent repurposed scripts across the whole watchlist, for the Home
// page's "Your recent repurposes" panel.
export const getRecentRepurposes = cache(async (): Promise<RepurposeSummary[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("outlier_repurposes")
    .select(REPURPOSE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<RepurposeRow[]>();
  return (data ?? []).map(toRepurposeSummary);
});

// RLS grants a read here to the owner OR to anyone when is_public is true
// (see migration 0013) — so this same function backs both the private
// detail page and the public share page, with no separate query needed.
export const getRepurposeDetail = cache(async (id: string): Promise<RepurposeDetail | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("outlier_repurposes").select(REPURPOSE_COLUMNS).eq("id", id).maybeSingle<RepurposeRow>();
  if (!data) return null;
  return { ...toRepurposeSummary(data), topic: data.topic, hook: data.hook, beats: data.beats };
});

// Named groupings of favourited posts ("Q1 ideas", "Client X") — a post can
// sit in more than one. Two queries (collections, then their memberships)
// rather than a join, since most users will have a handful of collections
// with a handful of posts each — not worth a heavier query shape.
export const getCollections = cache(async (): Promise<Collection[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data: collections } = await supabase.from("outlier_collections").select("id, name").order("created_at");
  if (!collections || collections.length === 0) return [];

  const { data: memberships } = await supabase
    .from("outlier_collection_posts")
    .select("collection_id, post_id")
    .in(
      "collection_id",
      collections.map((c) => c.id)
    );

  const postIdsByCollection = new Map<string, string[]>();
  for (const m of memberships ?? []) {
    postIdsByCollection.set(m.collection_id, [...(postIdsByCollection.get(m.collection_id) ?? []), m.post_id]);
  }

  return collections.map((c) => ({ id: c.id, name: c.name, postIds: postIdsByCollection.get(c.id) ?? [] }));
});
