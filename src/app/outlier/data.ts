// Outlier's data shapes. Creators/posts/jobs/repurposes come from
// live-data.ts (a real Apify- and Claude-backed pipeline) — this file holds
// only the shared types.

export type Platform = "IG" | "TT" | "YT";

export type Handle = {
  id: string;
  platform: Platform;
  handle: string;
  postCount: number;
  thin: boolean;
};

export type Creator = {
  id: string;
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  handles: Handle[];
  median: number;
  bestScore: number;
  hitsAbove2x: number;
  cadence: string;
  medianTrend: number | null; // null = thin history, no reliable trend
  spark: number[];
};

export type Post = {
  id: string;
  creatorId: string;
  platform: Platform;
  caption: string;
  description: string;
  thumbnailUrl: string | null;
  views: number;
  median: number;
  score: number;
  postedAt: string;
  // Raw ISO timestamp of when this was posted on the platform — sorting
  // by newest/oldest uses this instead of re-parsing the formatted
  // `postedAt` display string, which drops the year.
  postedAtIso: string;
  // Raw ISO timestamp of when we pulled this post (not when it was posted
  // on the platform) — for "new since" / recency-based insights.
  createdAtIso: string;
  duration: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement: number;
  followers: number;
  thin: boolean;
  favourite: boolean;
  analysisStatus: "none" | "analyzing" | "done" | "failed";
};

export type TranscriptLine = { t: string; text: string; isHook: boolean };
export type Beat = { name: string; timecode: string; analysis: string };

// Aggregated across a creator's already-analyzed posts (analysis_status
// 'done') — never fabricated, and empty when nothing's been analyzed yet.
export type TagCount = { label: string; count: number };
export type CreatorPatterns = {
  analyzedCount: number;
  hookTags: TagCount[];
  beatNames: TagCount[];
};

export type Job = {
  id: string;
  creatorId: string;
  handle: string;
  platform: Platform;
  scope: string;
  stage: string;
  pct: number;
  eta: string;
  state: "running" | "queued" | "failed" | "done";
  error?: string;
  waitReason?: string;
};

export type Collection = { id: string; name: string; postIds: string[] };

export type RepurposeBeat = { name: string; script: string };

export type RepurposeSummary = {
  id: string;
  postId: string;
  creatorId: string;
  title: string;
  sourceScore: number;
  createdAtIso: string;
  isPublic: boolean;
};

export type RepurposeDetail = RepurposeSummary & {
  topic: string;
  hook: string;
  beats: RepurposeBeat[];
};

export function getPlatformLabel(platform: Platform) {
  if (platform === "IG") return "Instagram";
  if (platform === "TT") return "TikTok";
  return "YouTube";
}
