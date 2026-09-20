// Outlier's data shapes. Creators/posts/jobs come from live-data.ts (a real
// Apify-backed pipeline) — this file now holds only shared types plus
// repurpose history (RECENT_REPURPOSES), which stays permanently empty, with
// its own empty state, until that feature exists.

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
};

export type TranscriptLine = { t: string; text: string; isHook: boolean };
export type Beat = { name: string; timecode: string; analysis: string };

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

// No repurpose action is recorded anywhere yet — RepurposeButton is a stub.
export const RECENT_REPURPOSES: { title: string; creatorId: string; score: number; relativeTime: string }[] = [];

export function getPlatformLabel(platform: Platform) {
  if (platform === "IG") return "Instagram";
  if (platform === "TT") return "TikTok";
  return "YouTube";
}
