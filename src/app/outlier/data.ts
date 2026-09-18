// Outlier's data shapes. Creators/posts/jobs come from live-data.ts (a real
// Apify-backed pipeline) — this file now holds only shared types plus the
// handful of things that still have no backend: Trends' pattern-detection
// (TOPICS/HOOK_STYLES) and repurpose history (RECENT_REPURPOSES). Those stay
// permanently empty, with their own empty states, until those features exist.

export type Platform = "IG" | "TT" | "YT";

export type Handle = {
  platform: Platform;
  handle: string;
  postCount: number;
  thin: boolean;
};

export type Creator = {
  id: string;
  displayName: string;
  initials: string;
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
  views: number;
  median: number;
  score: number;
  postedAt: string;
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
  scope: string;
  stage: string;
  pct: number;
  eta: string;
  state: "running" | "queued" | "failed" | "done";
  error?: string;
  waitReason?: string;
};

// Still fixture-shaped — Trends' cross-creator pattern detection isn't
// built yet (it would need real posts, plus a clustering/NLP pass over
// captions and transcripts, not just a data source).
export const CREATORS: Creator[] = [];

export const TOPICS: { id: string; name: string; avgMultiplier: number; creators: string[]; spark: number[] }[] = [];

export const HOOK_STYLES: { name: string; example: string; avgMultiplier: number }[] = [];

// No repurpose action is recorded anywhere yet — RepurposeButton is a stub.
export const RECENT_REPURPOSES: { title: string; creatorId: string; score: number; relativeTime: string }[] = [];

export function getPlatformLabel(platform: Platform) {
  if (platform === "IG") return "Instagram";
  if (platform === "TT") return "TikTok";
  return "YouTube";
}

export function getCreator(id: string) {
  return CREATORS.find((creator) => creator.id === id);
}
