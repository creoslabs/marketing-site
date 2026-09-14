// Placeholder Outlier fixtures. Real data comes from the platform APIs at
// pull time — see design_handoff_outlier/README.md "State management".

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

export const CREATORS: Creator[] = [
  {
    id: "lifteddaily",
    displayName: "Lifted Daily",
    initials: "LD",
    handles: [
      { platform: "IG", handle: "@lifteddaily", postCount: 62, thin: false },
      { platform: "TT", handle: "@lifteddaily", postCount: 44, thin: false },
    ],
    median: 188000,
    bestScore: 6.4,
    hitsAbove2x: 21,
    cadence: "5 / wk",
    medianTrend: 34,
    spark: [40, 55, 48, 62, 58, 71],
  },
  {
    id: "marcusonmoney",
    displayName: "Marcus On Money",
    initials: "MM",
    handles: [
      { platform: "IG", handle: "@marcusonmoney", postCount: 38, thin: false },
      { platform: "YT", handle: "@marcusonmoney", postCount: 12, thin: false },
    ],
    median: 97000,
    bestScore: 4.1,
    hitsAbove2x: 14,
    cadence: "4 / wk",
    medianTrend: 12,
    spark: [30, 34, 33, 40, 38, 44],
  },
  {
    id: "kitchenwithkay",
    displayName: "Kitchen with Kay",
    initials: "KK",
    handles: [{ platform: "IG", handle: "@kitchenwithkay", postCount: 51, thin: false }],
    median: 233000,
    bestScore: 3.2,
    hitsAbove2x: 9,
    cadence: "3 / wk",
    medianTrend: -8,
    spark: [70, 66, 60, 58, 55, 52],
  },
  {
    id: "traildrivenrae",
    displayName: "Trail Driven Rae",
    initials: "TR",
    handles: [{ platform: "TT", handle: "@traildrivenrae", postCount: 29, thin: false }],
    median: 76000,
    bestScore: 2.9,
    hitsAbove2x: 6,
    cadence: "3 / wk",
    medianTrend: 5,
    spark: [22, 24, 23, 26, 25, 27],
  },
  {
    id: "devnotesbyjune",
    displayName: "Dev Notes by June",
    initials: "DJ",
    handles: [{ platform: "YT", handle: "@devnotesbyjune", postCount: 9, thin: true }],
    median: 53000,
    bestScore: 2.7,
    hitsAbove2x: 2,
    cadence: "1 / wk",
    medianTrend: null,
    spark: [18, 19, 20, 18, 21, 20],
  },
  {
    id: "cofactorcomedy",
    displayName: "Cofactor Comedy",
    initials: "CC",
    handles: [
      { platform: "IG", handle: "@cofactorcomedy", postCount: 40, thin: false },
      { platform: "TT", handle: "@cofactorcomedy", postCount: 33, thin: false },
    ],
    median: 141000,
    bestScore: 5.0,
    hitsAbove2x: 17,
    cadence: "6 / wk",
    medianTrend: 21,
    spark: [50, 54, 58, 55, 62, 66],
  },
  {
    id: "wanderwithnoa",
    displayName: "Wander with Noa",
    initials: "WN",
    handles: [{ platform: "IG", handle: "@wanderwithnoa", postCount: 8, thin: true }],
    median: 61000,
    bestScore: 3.4,
    hitsAbove2x: 3,
    cadence: "2 / wk",
    medianTrend: null,
    spark: [15, 17, 16, 18, 17, 19],
  },
  {
    id: "gainswithgeo",
    displayName: "Gains with Geo",
    initials: "GG",
    handles: [{ platform: "TT", handle: "@gainswithgeo", postCount: 46, thin: false }],
    median: 112000,
    bestScore: 3.8,
    hitsAbove2x: 11,
    cadence: "5 / wk",
    medianTrend: -3,
    spark: [40, 42, 39, 41, 38, 37],
  },
];

const c = (id: string) => CREATORS.find((creator) => creator.id === id)!;

export const HERO_POST: Post = {
  id: "reel_7710",
  creatorId: "lifteddaily",
  platform: "IG",
  caption:
    "Stop doing morning cardio if you actually want to keep the muscle you built. Here's what to do instead. #gymtips #fatloss #liftheavy",
  description:
    "Cold open on a treadmill, creator shaking their head directly to camera before the hook line finishes. Bold white caption text pinned top-third for the full runtime. Cuts to a gym floor for the setup, then a whiteboard-style breakdown for the payoff — three quick cuts, no more than two seconds each. Trending audio underneath, ducked under the voiceover. Closes on a text-on-screen CTA to save the post.",
  views: 1200000,
  median: 188000,
  score: 6.4,
  postedAt: "Sep 8",
  duration: "0:31",
  likes: 71400,
  comments: 2108,
  shares: 12300,
  saves: 18900,
  engagement: 8.7,
  followers: 302000,
  thin: false,
  favourite: false,
};

export const POSTS: Post[] = [
  HERO_POST,
  {
    id: "reel_7642",
    creatorId: "cofactorcomedy",
    platform: "TT",
    caption: "POV: your gym bro discovers protein for the first time",
    description: "Single-shot bit, no cuts, punchline lands at 0:09.",
    views: 705000,
    median: 141000,
    score: 5.0,
    postedAt: "Sep 9",
    duration: "0:14",
    likes: 44000,
    comments: 980,
    shares: 6100,
    saves: 3200,
    engagement: 7.5,
    followers: 210000,
    thin: false,
    favourite: false,
  },
  {
    id: "reel_7581",
    creatorId: "marcusonmoney",
    platform: "IG",
    caption: "The $47 mistake most first-time investors make",
    description: "Talking head over a whiteboard graphic, three-beat structure.",
    views: 397700,
    median: 97000,
    score: 4.1,
    postedAt: "Sep 7",
    duration: "0:52",
    likes: 21000,
    comments: 640,
    shares: 3900,
    saves: 5400,
    engagement: 6.9,
    followers: 165000,
    thin: false,
    favourite: true,
  },
  {
    id: "reel_7499",
    creatorId: "gainswithgeo",
    platform: "TT",
    caption: "Why your bench press stalled at the same weight for 6 weeks",
    description: "Gym-floor demo intercut with a form breakdown overlay.",
    views: 425600,
    median: 112000,
    score: 3.8,
    postedAt: "Sep 6",
    duration: "0:38",
    likes: 19800,
    comments: 511,
    shares: 2700,
    saves: 4100,
    engagement: 6.2,
    followers: 98000,
    thin: false,
    favourite: false,
  },
  {
    id: "reel_7440",
    creatorId: "wanderwithnoa",
    platform: "IG",
    caption: "The €38/night Lisbon apartment that ruined every hotel for me",
    description: "Walkthrough tour, natural sound only, no voiceover.",
    views: 207400,
    median: 61000,
    score: 3.4,
    postedAt: "Sep 9",
    duration: "0:46",
    likes: 15200,
    comments: 322,
    shares: 1900,
    saves: 6800,
    engagement: 9.1,
    followers: 44000,
    thin: true,
    favourite: false,
  },
  {
    id: "reel_7388",
    creatorId: "kitchenwithkay",
    platform: "IG",
    caption: "The 4-ingredient sauce I put on everything now",
    description: "Overhead cooking shot, text steps burned in.",
    views: 745600,
    median: 233000,
    score: 3.2,
    postedAt: "Sep 5",
    duration: "0:29",
    likes: 38700,
    comments: 890,
    shares: 5200,
    saves: 22100,
    engagement: 8.9,
    followers: 380000,
    thin: false,
    favourite: false,
  },
  {
    id: "reel_7350",
    creatorId: "traildrivenrae",
    platform: "TT",
    caption: "Things nobody tells you before your first 50-miler",
    description: "Trail POV footage over a voiceover list.",
    views: 220400,
    median: 76000,
    score: 2.9,
    postedAt: "Sep 4",
    duration: "1:02",
    likes: 12100,
    comments: 268,
    shares: 1400,
    saves: 3300,
    engagement: 7.8,
    followers: 61000,
    thin: false,
    favourite: false,
  },
  {
    id: "reel_7312",
    creatorId: "devnotesbyjune",
    platform: "YT",
    caption: "I replaced my entire CI pipeline with 40 lines of bash",
    description: "Screen recording with terminal walkthrough.",
    views: 143100,
    median: 53000,
    score: 2.7,
    postedAt: "Sep 8",
    duration: "3:14",
    likes: 6100,
    comments: 410,
    shares: 890,
    saves: 2900,
    engagement: 6.1,
    followers: 22000,
    thin: true,
    favourite: false,
  },
  {
    id: "reel_7290",
    creatorId: "gainswithgeo",
    platform: "TT",
    caption: "Rate my push day (be honest)",
    description: "Circuit demo, quick cuts between exercises.",
    views: 291200,
    median: 112000,
    score: 2.6,
    postedAt: "Sep 3",
    duration: "0:41",
    likes: 14200,
    comments: 380,
    shares: 1600,
    saves: 2200,
    engagement: 5.9,
    followers: 98000,
    thin: false,
    favourite: false,
  },
  {
    id: "reel_7255",
    creatorId: "cofactorcomedy",
    platform: "IG",
    caption: "When you say 'one more set' for the fourth time",
    description: "Two-person skit, single location.",
    views: 349400,
    median: 141000,
    score: 2.5,
    postedAt: "Sep 2",
    duration: "0:19",
    likes: 17600,
    comments: 420,
    shares: 1900,
    saves: 1400,
    engagement: 5.6,
    followers: 210000,
    thin: false,
    favourite: false,
  },
  {
    id: "reel_7211",
    creatorId: "marcusonmoney",
    platform: "YT",
    caption: "Why I stopped using a budgeting app",
    description: "Talking head, static shot.",
    views: 213400,
    median: 97000,
    score: 2.2,
    postedAt: "Sep 1",
    duration: "4:02",
    likes: 9800,
    comments: 310,
    shares: 780,
    saves: 1600,
    engagement: 5.1,
    followers: 165000,
    thin: false,
    favourite: false,
  },
  {
    id: "reel_7188",
    creatorId: "kitchenwithkay",
    platform: "TT",
    caption: "Weeknight dinner, 12 minutes start to finish",
    description: "Overhead cooking shot, sped up.",
    views: 466000,
    median: 233000,
    score: 2.0,
    postedAt: "Aug 31",
    duration: "0:33",
    likes: 21400,
    comments: 340,
    shares: 1100,
    saves: 5600,
    engagement: 6.3,
    followers: 380000,
    thin: false,
    favourite: false,
  },
];

export const TRANSCRIPT: TranscriptLine[] = [
  { t: "0:00", text: "Stop doing morning cardio.", isHook: true },
  { t: "0:04", text: "If you actually want to keep the muscle you built.", isHook: true },
  { t: "0:07", text: "Here's the problem — fasted cardio at high intensity", isHook: false },
  { t: "0:11", text: "burns through glycogen your muscles need to recover.", isHook: false },
  { t: "0:15", text: "Do this instead: walk first, lift second.", isHook: false },
  { t: "0:19", text: "Save your intensity for the weight room.", isHook: false },
  { t: "0:23", text: "Cardio after, when glycogen doesn't matter as much.", isHook: false },
  { t: "0:27", text: "Try it for two weeks and watch what happens.", isHook: false },
  { t: "0:29", text: "Save this so you remember tomorrow morning.", isHook: false },
];

export const BEATS: Beat[] = [
  {
    name: "HOOK",
    timecode: "0:00–0:04",
    analysis:
      "Negative command (\"Stop doing X\") delivered straight to camera before any setup — the viewer doesn't yet know what X costs them, which is the open loop.",
  },
  {
    name: "SETUP",
    timecode: "0:04–0:09",
    analysis:
      "States the cost of the mistake in one sentence, establishing stakes before the fix is offered.",
  },
  {
    name: "PAYOFF",
    timecode: "0:09–0:26",
    analysis:
      "Numbered, concrete fix delivered in the same order it should be performed, matched to on-screen whiteboard cuts.",
  },
  {
    name: "FIX",
    timecode: "0:26–0:29",
    analysis: "Reinforces the payoff with a short, testable claim (\"two weeks\").",
  },
  {
    name: "CTA",
    timecode: "0:29–0:31",
    analysis: "Save-CTA tied to a specific future moment (\"tomorrow morning\"), not generic.",
  },
];

export const HOOK_TAGS = ["negative command", "numbered payoff", "second person", "save-CTA"];

export const JOBS: Job[] = [
  {
    id: "job-1",
    creatorId: "marcusonmoney",
    scope: "12 new posts · IG",
    stage: "Downloading video 8 of 12",
    pct: 64,
    eta: "2 min left",
    state: "running",
  },
  {
    id: "job-2",
    creatorId: "cofactorcomedy",
    scope: "6 new posts · TT",
    stage: "Transcribing 3 of 6",
    pct: 48,
    eta: "4 min left",
    state: "running",
  },
  {
    id: "job-3",
    creatorId: "gainswithgeo",
    scope: "9 new posts · TT",
    stage: "Scoring 7 of 9",
    pct: 82,
    eta: "1 min left",
    state: "running",
  },
  {
    id: "job-4",
    creatorId: "kitchenwithkay",
    scope: "full backfill · 60 posts",
    stage: "queued",
    pct: 0,
    eta: "",
    state: "queued",
    waitReason: "waiting on rate limit window",
  },
  {
    id: "job-5",
    creatorId: "traildrivenrae",
    scope: "20 new posts · TT",
    stage: "queued",
    pct: 0,
    eta: "",
    state: "queued",
    waitReason: "waiting on download slot",
  },
  {
    id: "job-6",
    creatorId: "wanderwithnoa",
    scope: "8 new posts · IG",
    stage: "queued",
    pct: 0,
    eta: "",
    state: "queued",
    waitReason: "waiting on download slot",
  },
  {
    id: "job-7",
    creatorId: "devnotesbyjune",
    scope: "5 new posts · YT",
    stage: "queued",
    pct: 0,
    eta: "",
    state: "queued",
    waitReason: "waiting on transcription queue",
  },
  {
    id: "job-8",
    creatorId: "lifteddaily",
    scope: "3 new posts · TT",
    stage: "queued",
    pct: 0,
    eta: "",
    state: "queued",
    waitReason: "waiting on transcription queue",
  },
  {
    id: "job-9",
    creatorId: "wanderwithnoa",
    scope: "1 post · IG",
    stage: "failed",
    pct: 0,
    eta: "",
    state: "failed",
    error: "Video unavailable — post deleted before download finished.",
  },
  {
    id: "job-10",
    creatorId: "devnotesbyjune",
    scope: "4 posts · YT",
    stage: "failed",
    pct: 0,
    eta: "",
    state: "failed",
    error: "Rate limited after 3 retries. Next attempt in 18 min.",
  },
];

export const FINISHED_RECENTLY = [
  { creatorId: "lifteddaily", label: "reel_7710 scored 6.4×", relativeTime: "12m ago" },
  { creatorId: "cofactorcomedy", label: "vid_4021 scored 5.0×", relativeTime: "38m ago" },
  { creatorId: "marcusonmoney", label: "reel_7581 scored 4.1×", relativeTime: "1h ago" },
];

export const SETTINGS = {
  autoPullHours: 6,
  transcribeThreshold: "posts above 2×",
  retainVideoDays: 30,
  medianWindow: 20,
  thinHistoryFloor: 12,
};

export const TOPICS = [
  {
    id: "fasted-cardio",
    name: "Fasted cardio myths",
    avgMultiplier: 4.2,
    creators: ["lifteddaily", "gainswithgeo"],
    spark: [30, 38, 42, 55, 60, 64],
  },
  {
    id: "budgeting-apps",
    name: "Why budgeting apps fail",
    avgMultiplier: 3.1,
    creators: ["marcusonmoney"],
    spark: [20, 24, 22, 28, 30, 31],
  },
  {
    id: "one-pan-dinners",
    name: "One-pan weeknight dinners",
    avgMultiplier: 2.8,
    creators: ["kitchenwithkay"],
    spark: [40, 38, 44, 41, 46, 48],
  },
];

export const HOOK_STYLES = [
  { name: "Negative command opener", example: '"Stop doing X if you want Y"', avgMultiplier: 4.6 },
  { name: "Numbered payoff", example: '"Three things nobody tells you about X"', avgMultiplier: 3.9 },
  { name: "POV skit", example: '"POV: your gym bro discovers X"', avgMultiplier: 3.2 },
];

export const RECENT_REPURPOSES = [
  { title: "Stop doing morning cardio (remix)", creatorId: "lifteddaily", score: 6.4, relativeTime: "2h ago" },
  { title: "The gym-bro protein bit, longer cut", creatorId: "cofactorcomedy", score: 5.0, relativeTime: "1d ago" },
];

const RANK_OVERRIDES: Record<string, number> = {
  reel_7710: 4,
  reel_7642: 6,
  reel_7581: 5,
  reel_7499: 5,
  reel_7440: 3,
  reel_7388: 8,
  reel_7350: 4,
  reel_7312: 3,
  reel_7290: 9,
  reel_7255: 7,
  reel_7211: 6,
  reel_7188: 11,
};

export function getRankInfo(post: Post) {
  const creator = getCreator(post.creatorId);
  const handle = creator.handles.find((h) => h.platform === post.platform) ?? creator.handles[0];
  return { rank: RANK_OVERRIDES[post.id] ?? 1, outOf: handle.postCount };
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
