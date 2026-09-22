import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
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

type CreatorRow = { id: string; display_name: string | null };
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
  transcript: TranscriptLine[] | null;
  beats: Beat[] | null;
  hook_tags: string[] | null;
  favourited: boolean;
  created_at: string;
};

function buildCreator(row: CreatorRow, handles: HandleRow[], postsByHandle: Map<string, PostRow[]>): Creator {
  const allPosts = handles.flatMap((h) => postsByHandle.get(h.id) ?? []);
  const views = allPosts.map((p) => p.views);
  const median = medianOf(views);
  const scores = median > 0 ? views.map((v) => v / median) : [];
  const sortedDesc = [...allPosts].sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());

  const name = row.display_name ?? handles[0]?.handle ?? "Unknown";
  const initials = name.replace(/^@/, "").slice(0, 2).toUpperCase();
  const avatarUrl = handles.find((h) => h.avatar_url)?.avatar_url ?? null;

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
  };
}

// Fetches every creator this user tracks, each with all of its handles'
// posts combined (a person tracked on two platforms is one Creator card).
// cache()-wrapped because getCreators/getPosts/getCreatorDetail all call
// this — without dedup, a page needing both (e.g. Feed calling
// getCreators() and getPosts() together) ran all three queries twice.
const loadAll = cache(async () => {
  const supabase = await createClient();

  // outlier_handles carries its own user_id (RLS: auth.uid() = user_id),
  // so it doesn't need creatorRows' ids to be scoped safely — fetching it
  // alongside creators instead of after them turns a 3-step waterfall
  // (creators -> handles -> posts) into 2 steps, cutting a full
  // Supabase round trip off of every Outlier page load.
  const [{ data: creatorRows }, { data: handleRows }] = await Promise.all([
    supabase.from("outlier_creators").select("id, display_name").order("created_at", { ascending: false }).returns<CreatorRow[]>(),
    supabase
      .from("outlier_handles")
      .select("id, creator_id, platform, handle, status, error, last_pulled_at, avatar_url")
      .returns<HandleRow[]>(),
  ]);
  if (!creatorRows || creatorRows.length === 0) {
    return { supabase, creators: [] as Creator[], handlesByCreator: new Map<string, HandleRow[]>(), postsByHandle: new Map<string, PostRow[]>() };
  }
  const handles = handleRows ?? [];

  const { data: postRows } = await supabase
    .from("outlier_posts")
    .select("*")
    .in(
      "handle_id",
      handles.map((h) => h.id)
    )
    .order("posted_at", { ascending: false })
    .returns<PostRow[]>();
  const posts = postRows ?? [];

  const postsByHandle = new Map<string, PostRow[]>();
  for (const post of posts) {
    postsByHandle.set(post.handle_id, [...(postsByHandle.get(post.handle_id) ?? []), post]);
  }

  const handlesByCreator = new Map<string, HandleRow[]>();
  for (const h of handles) {
    handlesByCreator.set(h.creator_id, [...(handlesByCreator.get(h.creator_id) ?? []), h]);
  }

  const creators = creatorRows
    .map((row) => buildCreator(row, handlesByCreator.get(row.id) ?? [], postsByHandle))
    .filter((c) => c.handles.length > 0); // a creator that just lost its last handle shouldn't linger

  return { supabase, creators, handlesByCreator, postsByHandle };
});

export const getCreators = cache(async (): Promise<Creator[]> => {
  if (!isSupabaseConfigured()) return [];
  const { creators } = await loadAll();
  return creators;
});

// Top outliers across the whole watchlist, for the Feed/Home pages.
export const getPosts = cache(async (): Promise<Post[]> => {
  if (!isSupabaseConfigured()) return [];
  const { creators, handlesByCreator, postsByHandle } = await loadAll();
  if (creators.length === 0) return [];

  const posts: Post[] = [];
  for (const creator of creators) {
    const handles = handlesByCreator.get(creator.id) ?? [];
    const thin = creator.handles.every((h) => h.thin);
    for (const handle of handles) {
      const rows = postsByHandle.get(handle.id) ?? [];
      for (const row of rows) {
        posts.push(buildPost(row, creator.id, creator.median, thin));
      }
    }
  }

  return posts.sort((a, b) => b.score - a.score);
});

// Favourited posts across the whole watchlist, for the Favourites page.
export const getFavouritePosts = cache(async (): Promise<Post[]> => {
  const posts = await getPosts();
  return posts.filter((post) => post.favourite);
});

export const getCreatorDetail = cache(
  async (id: string): Promise<{ creator: Creator; posts: Post[]; patterns: CreatorPatterns } | null> => {
    if (!isSupabaseConfigured()) return null;
    const { creators, handlesByCreator, postsByHandle } = await loadAll();
    const creator = creators.find((c) => c.id === id);
    if (!creator) return null;

    const handles = handlesByCreator.get(id) ?? [];
    const overallThin = creator.handles.every((h) => h.thin);
    const rows = handles.flatMap((h) => postsByHandle.get(h.id) ?? []);
    const posts = rows
      .map((row) => buildPost(row, id, creator.median, overallThin))
      .sort((a, b) => new Date(b.postedAtIso).getTime() - new Date(a.postedAtIso).getTime());
    const patterns = computePatterns(rows);

    return { creator, posts, patterns };
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

export const getJobs = cache(
  async (): Promise<{
    jobs: Job[];
    finished: { creatorId: string; handle: string; newPostsCount: number; label: string; relativeTime: string; finishedAtIso: string }[];
  }> => {
    if (!isSupabaseConfigured()) return { jobs: [], finished: [] };

    const supabase = await createClient();
    const { data } = await supabase
      .from("outlier_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<JobRow[]>();
    const rows = data ?? [];
    if (rows.length === 0) return { jobs: [], finished: [] };

    const { data: handleRows } = await supabase
      .from("outlier_handles")
      .select("id, creator_id, platform, handle")
      .in(
        "id",
        rows.map((r) => r.handle_id)
      )
      .returns<{ id: string; creator_id: string; platform: Platform; handle: string }[]>();
    const handleById = new Map((handleRows ?? []).map((h) => [h.id, h]));

    const jobs: Job[] = rows
      .filter((r) => r.state === "queued" || r.state === "running" || r.state === "failed")
      .map((r) => {
        const h = handleById.get(r.handle_id);
        return {
          id: r.id,
          creatorId: h?.creator_id ?? "",
          handle: h?.handle ?? "",
          platform: h?.platform ?? "TT",
          scope: "Pull",
          stage: r.stage ?? (r.state === "running" ? "Pulling posts…" : r.state === "failed" ? "Failed" : "Queued"),
          pct: r.state === "running" ? 50 : 0,
          eta: "",
          state: r.state,
          error: r.error ?? undefined,
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
