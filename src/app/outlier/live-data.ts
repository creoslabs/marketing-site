import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/relative-time";
import type { Creator, Post, Job, Platform, TranscriptLine, Beat } from "./data";

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && /^https?:\/\//.test(url));
}

// Matches SETTINGS.thinHistoryFloor in data.ts.
const THIN_HISTORY_FLOOR = 12;

function medianOf(nums: number[]) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Posts/week over the actual date spread of what's been pulled — not a
// fixed assumption, since a creator's real posting cadence varies.
function computeCadence(postedAtIso: string[]): string {
  if (postedAtIso.length < 2) return "—";
  const times = postedAtIso.map((d) => new Date(d).getTime()).sort((a, b) => a - b);
  const spanDays = (times[times.length - 1] - times[0]) / 86_400_000;
  if (spanDays < 1) return `${postedAtIso.length}/day`;
  const perWeek = postedAtIso.length / (spanDays / 7);
  return `${perWeek.toFixed(1)}/week`;
}

// Real trend: median of the more-recent half of pulled posts vs the older
// half. Needs enough posts on both sides to mean anything — returns null
// (rendered as "thin history, no reliable trend") otherwise.
function computeMedianTrend(viewsMostRecentFirst: number[]): number | null {
  if (viewsMostRecentFirst.length < 6) return null;
  const half = Math.floor(viewsMostRecentFirst.length / 2);
  const recentMedian = medianOf(viewsMostRecentFirst.slice(0, half));
  const olderMedian = medianOf(viewsMostRecentFirst.slice(half));
  if (olderMedian === 0) return null;
  return Math.round(((recentMedian - olderMedian) / olderMedian) * 100);
}

type CreatorRow = { id: string; platform: Platform; handle: string; display_name: string | null };

type PostRow = {
  id: string;
  creator_id: string;
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
};

function buildCreatorStats(posts: { views: number; posted_at: string }[]) {
  const views = posts.map((p) => p.views);
  const median = medianOf(views);
  const scores = median > 0 ? views.map((v) => v / median) : [];
  const sortedDesc = [...posts].sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
  return {
    median,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    hitsAbove2x: scores.filter((s) => s >= 2).length,
    cadence: computeCadence(posts.map((p) => p.posted_at)),
    medianTrend: computeMedianTrend(sortedDesc.map((p) => p.views)),
    spark: sortedDesc.slice(0, 10).map((p) => p.views).reverse(),
    postCount: posts.length,
  };
}

// Each tracked handle is its own Creator card — a person tracked on both
// TikTok and Instagram shows up as two entries rather than one merged
// creator, since a pull operates on a single (platform, handle) at a time.
function buildCreator(row: CreatorRow, posts: { views: number; posted_at: string }[]): Creator {
  const stats = buildCreatorStats(posts);
  const name = row.display_name ?? row.handle;
  const initials = name.replace(/^@/, "").slice(0, 2).toUpperCase();
  return {
    id: row.id,
    displayName: name,
    initials,
    handles: [
      { platform: row.platform, handle: row.handle, postCount: stats.postCount, thin: stats.postCount < THIN_HISTORY_FLOOR },
    ],
    median: stats.median,
    bestScore: stats.bestScore,
    hitsAbove2x: stats.hitsAbove2x,
    cadence: stats.cadence,
    medianTrend: stats.medianTrend,
    spark: stats.spark,
  };
}

function buildPost(row: PostRow, creatorMedian: number, thin: boolean): Post {
  const likes = row.likes;
  const comments = row.comments;
  const shares = row.shares;
  const saves = row.saves ?? 0;
  const engagement = row.views > 0 ? ((likes + comments + shares + saves) / row.views) * 100 : 0;
  return {
    id: row.id,
    creatorId: row.creator_id,
    platform: row.platform,
    caption: row.caption ?? "",
    // Real scraped posts don't have a separate "description" field distinct
    // from the caption — the fixture's split was cosmetic, not real.
    description: "",
    views: row.views,
    median: creatorMedian,
    score: creatorMedian > 0 ? row.views / creatorMedian : 0,
    postedAt: formatDate(row.posted_at),
    duration: row.duration_seconds != null ? formatDuration(row.duration_seconds) : "",
    likes,
    comments,
    shares,
    saves,
    engagement,
    followers: row.followers ?? 0,
    thin,
    favourite: false,
  };
}

export const getCreators = cache(async (): Promise<Creator[]> => {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data: creatorRows } = await supabase
    .from("outlier_creators")
    .select("id, platform, handle, display_name")
    .order("created_at", { ascending: false })
    .returns<CreatorRow[]>();
  if (!creatorRows || creatorRows.length === 0) return [];

  const { data: postRows } = await supabase
    .from("outlier_posts")
    .select("creator_id, views, posted_at")
    .in(
      "creator_id",
      creatorRows.map((c) => c.id)
    )
    .returns<{ creator_id: string; views: number; posted_at: string }[]>();

  const postsByCreator = new Map<string, { views: number; posted_at: string }[]>();
  for (const row of postRows ?? []) {
    postsByCreator.set(row.creator_id, [...(postsByCreator.get(row.creator_id) ?? []), row]);
  }

  return creatorRows.map((row) => buildCreator(row, postsByCreator.get(row.id) ?? []));
});

// Top outliers across the whole watchlist, for the Feed/Home pages.
export const getPosts = cache(async (): Promise<Post[]> => {
  if (!isSupabaseConfigured()) return [];

  const creators = await getCreators();
  if (creators.length === 0) return [];

  const medianByCreatorId = new Map(creators.map((c) => [c.id, c.median]));
  const thinByCreatorId = new Map(creators.map((c) => [c.id, c.handles[0].thin]));

  const supabase = await createClient();
  const { data: postRows } = await supabase
    .from("outlier_posts")
    .select("*")
    .in(
      "creator_id",
      creators.map((c) => c.id)
    )
    .order("posted_at", { ascending: false })
    .returns<PostRow[]>();

  const posts = (postRows ?? []).map((row) =>
    buildPost(row, medianByCreatorId.get(row.creator_id) ?? 0, thinByCreatorId.get(row.creator_id) ?? false)
  );

  return posts.sort((a, b) => b.score - a.score);
});

export const getCreatorDetail = cache(async (id: string): Promise<{ creator: Creator; posts: Post[] } | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("outlier_creators")
    .select("id, platform, handle, display_name")
    .eq("id", id)
    .maybeSingle<CreatorRow>();
  if (!row) return null;

  const { data: postRows } = await supabase
    .from("outlier_posts")
    .select("*")
    .eq("creator_id", id)
    .order("posted_at", { ascending: false })
    .returns<PostRow[]>();
  const rows = postRows ?? [];

  const creator = buildCreator(
    row,
    rows.map((p) => ({ views: p.views, posted_at: p.posted_at }))
  );
  const thin = creator.handles[0].thin;
  const posts = rows.map((p) => buildPost(p, creator.median, thin));

  return { creator, posts };
});

export const getPostDetail = cache(
  async (id: string): Promise<{ post: Post; creator: Creator; rank: number; outOf: number; row: PostRow } | null> => {
    if (!isSupabaseConfigured()) return null;

    const supabase = await createClient();
    const { data: row } = await supabase.from("outlier_posts").select("*").eq("id", id).maybeSingle<PostRow>();
    if (!row) return null;

    const detail = await getCreatorDetail(row.creator_id);
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
  creator_id: string;
  state: "queued" | "running" | "done" | "failed";
  stage: string | null;
  new_posts_count: number | null;
  error: string | null;
  created_at: string;
  finished_at: string | null;
};

export const getJobs = cache(
  async (): Promise<{ jobs: Job[]; finished: { creatorId: string; label: string; relativeTime: string }[] }> => {
    if (!isSupabaseConfigured()) return { jobs: [], finished: [] };

    const supabase = await createClient();
    const { data } = await supabase
      .from("outlier_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<JobRow[]>();
    const rows = data ?? [];

    const jobs: Job[] = rows
      .filter((r) => r.state === "queued" || r.state === "running" || r.state === "failed")
      .map((r) => ({
        id: r.id,
        creatorId: r.creator_id,
        scope: "Pull",
        stage: r.stage ?? (r.state === "running" ? "Pulling posts…" : r.state === "failed" ? "Failed" : "Queued"),
        pct: r.state === "running" ? 50 : 0,
        eta: "",
        state: r.state,
        error: r.error ?? undefined,
      }));

    const finished = rows
      .filter((r) => r.state === "done")
      .slice(0, 10)
      .map((r) => ({
        creatorId: r.creator_id,
        label: `Pulled ${r.new_posts_count ?? 0} new post${r.new_posts_count === 1 ? "" : "s"}`,
        relativeTime: relativeTime(r.finished_at ?? r.created_at),
      }));

    return { jobs, finished };
  }
);
