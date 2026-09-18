// Outlier's data shapes. Every collection below starts empty — real data
// comes from the platform APIs at pull time (see
// design_handoff_outlier/README.md "State management"), which isn't wired
// up yet. Every screen has an empty state for exactly this reason.

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

export const CREATORS: Creator[] = [];

const c = (id: string) => CREATORS.find((creator) => creator.id === id)!;

export const POSTS: Post[] = [];

export const TRANSCRIPT: TranscriptLine[] = [];

export const BEATS: Beat[] = [];

export const HOOK_TAGS: string[] = [];

export const JOBS: Job[] = [];

export const FINISHED_RECENTLY: { creatorId: string; label: string; relativeTime: string }[] = [];

export const SETTINGS = {
  autoPullHours: 6,
  transcribeThreshold: "posts above 2×",
  retainVideoDays: 30,
  medianWindow: 20,
  thinHistoryFloor: 12,
};

export const TOPICS: { id: string; name: string; avgMultiplier: number; creators: string[]; spark: number[] }[] = [];

export const HOOK_STYLES: { name: string; example: string; avgMultiplier: number }[] = [];

export const RECENT_REPURPOSES: { title: string; creatorId: string; score: number; relativeTime: string }[] = [];

export function getRankInfo(post: Post) {
  const creator = getCreator(post.creatorId);
  const handle = creator.handles.find((h) => h.platform === post.platform) ?? creator.handles[0];
  return { rank: 1, outOf: handle.postCount };
}

export function getPost(id: string) {
  return POSTS.find((post) => post.id === id);
}

export function getPlatformLabel(platform: Platform) {
  if (platform === "IG") return "Instagram";
  if (platform === "TT") return "TikTok";
  return "YouTube";
}

export function getCreator(id: string) {
  return c(id);
}

export function getCreatorPosts(id: string) {
  return POSTS.filter((post) => post.creatorId === id);
}

// Deterministic pseudo-random history for the per-creator views chart —
// seeded by id + index so it's stable across server/client renders.
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

export function getCreatorHistory(creator: Creator) {
  const rand = seededRandom(creator.id);
  const bestViews = creator.median * creator.bestScore;
  return Array.from({ length: 10 }, (_, i) => {
    const isSpike = i === 6;
    const base = creator.median * (0.6 + rand() * 0.8);
    return {
      index: i,
      views: Math.round(isSpike ? bestViews : base),
      isOutlier: isSpike,
    };
  });
}
