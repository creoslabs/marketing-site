// Placeholder Signal fixtures. Real data comes from the analysis pipeline at
// upload time — see design_handoff_signal/README.md "State".

export type Format = "video" | "static";
export type Verdict = "pass" | "partial" | "fail";
export type Tier = 1 | 2;

export type Criterion = {
  name: string;
  tier: Tier;
  evidence: string;
  verdict: Verdict;
};

export const VIDEO_CRITERIA_ORDER = [
  "Safe-zone overlap across full runtime",
  "Cut frequency vs platform pacing",
  "Hook window motion detected",
  "Hook window face detected",
  "Hook window text on screen",
  "Hook window audio onset",
  "Aspect ratio",
  "Resolution",
  "Duration",
  "On-screen text coverage",
  "Product first appearance",
  "Product visible duration",
  "Message clarity in hook window",
  "Native feel vs polished ad",
  "Text legibility & hold time",
  "Sound-off redundancy",
] as const;

export const STATIC_CRITERIA_ORDER = [
  "Safe-zone overlap",
  "Aspect ratio",
  "Resolution",
  "On-screen text legibility",
  "Product framing & legibility",
  "Scroll-stopping composition",
  "Message clarity at a glance",
] as const;

export type VideoFinding = {
  id: string;
  t: number; // 0-18
  criterion: string;
  tier: Tier;
  failure: boolean;
  body: string;
};

export type StaticFinding = {
  id: string;
  marker: "A" | "B" | "check";
  criterion: string;
  tier: Tier;
  body: string;
  region: { top: number; left: number; width: number; height: number };
};

export type Asset = {
  id: string;
  filename: string;
  format: Format;
  platform: "TikTok" | "Instagram";
  score: number;
  failedChecks: number;
  postedAt: string;
  duration?: string;
  issuePill?: string;
  criteria: Criterion[];
  assetUrl?: string | null;
};

function countVerdicts(criteria: Criterion[]) {
  return {
    pass: criteria.filter((c) => c.verdict === "pass").length,
    partial: criteria.filter((c) => c.verdict === "partial").length,
    fail: criteria.filter((c) => c.verdict === "fail").length,
  };
}

// The canonical video example — a TikTok reel, 0:18, matching the exact
// evidence strings from the handoff ("0:04–0:07, 0:17–0:18", "2 cuts / 18s",
// "61% of runtime") so the report reads as falsifiable, computed data.
export const VIDEO_CRITERIA: Criterion[] = [
  { name: "Safe-zone overlap across full runtime", tier: 1, evidence: "0:04–0:07, 0:17–0:18", verdict: "fail" },
  { name: "Cut frequency vs platform pacing", tier: 1, evidence: "2 cuts / 18s", verdict: "pass" },
  { name: "Hook window motion detected", tier: 1, evidence: "Motion at 0:00–0:02", verdict: "pass" },
  { name: "Hook window face detected", tier: 1, evidence: "Face visible 0:00–0:03", verdict: "pass" },
  { name: "Hook window text on screen", tier: 1, evidence: "No text before 0:04", verdict: "fail" },
  { name: "Hook window audio onset", tier: 1, evidence: "Onset at 0:02, slightly late", verdict: "partial" },
  { name: "Aspect ratio", tier: 1, evidence: "9:16 vertical", verdict: "pass" },
  { name: "Resolution", tier: 1, evidence: "1080×1920", verdict: "pass" },
  { name: "Duration", tier: 1, evidence: "0:18, platform favours <15s", verdict: "partial" },
  { name: "On-screen text coverage", tier: 1, evidence: "61% of runtime", verdict: "fail" },
  { name: "Product first appearance", tier: 2, evidence: "First shown at 0:14", verdict: "fail" },
  { name: "Product visible duration", tier: 2, evidence: "4s total, 22% of runtime", verdict: "fail" },
  { name: "Message clarity in hook window", tier: 2, evidence: "Message implied, not stated", verdict: "partial" },
  { name: "Native feel vs polished ad", tier: 2, evidence: "Reads as organic content", verdict: "pass" },
  { name: "Text legibility & hold time", tier: 2, evidence: "Legible but held <1s per instance", verdict: "partial" },
  { name: "Sound-off redundancy", tier: 2, evidence: "Message is lost without audio", verdict: "fail" },
];

export const VIDEO_FINDINGS: VideoFinding[] = [
  { id: "vf-1", t: 0, criterion: "Hook window motion detected", tier: 1, failure: false, body: "Motion begins immediately — a strong pattern interrupt." },
  { id: "vf-2", t: 2, criterion: "Hook window audio onset", tier: 1, failure: false, body: "Audio onset lands at 0:02, slightly after the visual hook." },
  { id: "vf-3", t: 4, criterion: "Safe-zone overlap across full runtime", tier: 1, failure: true, body: "Caption enters the top safe-zone band and stays until 0:07." },
  { id: "vf-4", t: 4, criterion: "Hook window text on screen", tier: 1, failure: true, body: "No on-screen text appears before the hook window closes at 0:04." },
  { id: "vf-5", t: 9, criterion: "On-screen text coverage", tier: 1, failure: true, body: "Text covers 61% of the runtime — starting to read as cluttered." },
  { id: "vf-6", t: 14, criterion: "Product first appearance", tier: 2, failure: true, body: "Product isn't shown until 0:14 — 78% of the way through an 18s ad." },
  { id: "vf-7", t: 17, criterion: "Safe-zone overlap across full runtime", tier: 1, failure: true, body: "Caption re-enters the safe zone from 0:17 to the end." },
];

export const VIDEO_TOP_FIX = {
  title: "Move captions out of the safe zone",
  clears: 4,
  body: "Recomposing the caption track below the bottom safe-zone band clears the safe-zone violation, both text-coverage flags, and lets the hook text land inside the window instead of after it.",
};

export const VIDEO_ASSET: Asset = {
  id: "vid-lifted-1",
  filename: "lifted_daily_morning_cardio.mp4",
  format: "video",
  platform: "TikTok",
  score: Math.round(
    ((countVerdicts(VIDEO_CRITERIA).pass + countVerdicts(VIDEO_CRITERIA).partial * 0.5) / VIDEO_CRITERIA.length) * 100
  ),
  failedChecks: countVerdicts(VIDEO_CRITERIA).fail,
  postedAt: "Sep 9",
  duration: "0:18",
  issuePill: "1 safe-zone fail",
  criteria: VIDEO_CRITERIA,
};

// The canonical static example — matches the handoff's own illustrative
// library badge ("81 over STATIC · 7") and footer ("93rd of statics").
export const STATIC_CRITERIA: Criterion[] = [
  { name: "Safe-zone overlap", tier: 1, evidence: "CTA button crosses bottom safe zone", verdict: "fail" },
  { name: "Aspect ratio", tier: 1, evidence: "4:5 vertical", verdict: "pass" },
  { name: "Resolution", tier: 1, evidence: "1080×1350", verdict: "pass" },
  { name: "On-screen text legibility", tier: 1, evidence: "High contrast, legible at thumbnail size", verdict: "pass" },
  { name: "Product framing & legibility", tier: 2, evidence: "Product is clearly framed and readable", verdict: "pass" },
  { name: "Scroll-stopping composition", tier: 2, evidence: "Competent but not distinctive", verdict: "partial" },
  { name: "Message clarity at a glance", tier: 2, evidence: "Headline requires a beat to parse", verdict: "fail" },
];

export const STATIC_FINDINGS: StaticFinding[] = [
  {
    id: "sf-b",
    marker: "B",
    criterion: "Safe-zone overlap",
    tier: 1,
    body: "The CTA button sits outside the bottom safe zone and risks being covered by platform UI.",
    region: { top: 84, left: 18, width: 64, height: 10 },
  },
  {
    id: "sf-a",
    marker: "A",
    criterion: "Message clarity at a glance",
    tier: 2,
    body: "The headline requires a beat to parse — consider a more literal first line.",
    region: { top: 8, left: 10, width: 50, height: 14 },
  },
  {
    id: "sf-check",
    marker: "check",
    criterion: "Product framing & legibility",
    tier: 2,
    body: "Product framing is clean and legible even at thumbnail size — keep this in the next version.",
    region: { top: 32, left: 24, width: 52, height: 40 },
  },
];

export const STATIC_TOP_FIX = {
  title: "Move the CTA button inside the safe zone",
  clears: 2,
  body: "Shifting the CTA up 40px clears the safe-zone violation and removes the risk of the button being covered by the platform's own UI chrome.",
};

export const STATIC_ASSET: Asset = {
  id: "static-kay-1",
  filename: "kitchenwithkay_sauce_static.jpg",
  format: "static",
  platform: "Instagram",
  score: 81,
  failedChecks: countVerdicts(STATIC_CRITERIA).fail,
  postedAt: "Sep 9",
  issuePill: undefined,
  criteria: STATIC_CRITERIA,
};

// Additional library-only fixtures — no full report behind these, just
// populate the grid/table with a realistic mixed-format spread.
export const LIBRARY_ONLY_ASSETS: Asset[] = [
  { id: "vid-2", filename: "marcus_budget_mistake.mp4", format: "video", platform: "Instagram", score: 58, failedChecks: 6, postedAt: "Sep 7", duration: "0:52", criteria: [] },
  { id: "static-2", filename: "gainswithgeo_pushday.jpg", format: "static", platform: "Instagram", score: 74, failedChecks: 2, postedAt: "Sep 6", criteria: [] },
  { id: "vid-3", filename: "cofactor_protein_bit.mp4", format: "video", platform: "TikTok", score: 66, failedChecks: 5, postedAt: "Sep 5", duration: "0:14", issuePill: "no hook", criteria: [] },
  { id: "static-3", filename: "traildriven_50miler.jpg", format: "static", platform: "Instagram", score: 45, failedChecks: 4, postedAt: "Sep 4", criteria: [] },
  { id: "vid-4", filename: "wander_lisbon_apartment.mp4", format: "video", platform: "TikTok", score: 71, failedChecks: 3, postedAt: "Sep 9", duration: "0:46", criteria: [] },
  { id: "static-4", filename: "devnotes_cli_screenshot.jpg", format: "static", platform: "Instagram", score: 52, failedChecks: 3, postedAt: "Sep 8", criteria: [] },
  { id: "vid-5", filename: "lifted_daily_form_check.mp4", format: "video", platform: "TikTok", score: 39, failedChecks: 9, postedAt: "Sep 2", duration: "0:41", issuePill: "1 safe-zone fail", criteria: [] },
  { id: "static-5", filename: "kitchenwithkay_dinner.jpg", format: "static", platform: "Instagram", score: 63, failedChecks: 3, postedAt: "Aug 31", criteria: [] },
  { id: "vid-6", filename: "cofactor_one_more_set.mp4", format: "video", platform: "Instagram", score: 55, failedChecks: 6, postedAt: "Sep 2", duration: "0:19", criteria: [] },
  { id: "static-6", filename: "marcus_no_budget_app.jpg", format: "static", platform: "Instagram", score: 88, failedChecks: 1, postedAt: "Sep 1", criteria: [] },
];

export const ASSETS: Asset[] = [VIDEO_ASSET, STATIC_ASSET, ...LIBRARY_ONLY_ASSETS];

export function getAsset(id: string) {
  return ASSETS.find((a) => a.id === id);
}

export function getFullCriteria(id: string): Criterion[] {
  if (id === VIDEO_ASSET.id) return VIDEO_CRITERIA;
  if (id === STATIC_ASSET.id) return STATIC_CRITERIA;
  return [];
}

function medianOf(nums: number[]) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function percentileWithin(score: number, format: Format) {
  const scores = ASSETS.filter((a) => a.format === format).map((a) => a.score);
  const below = scores.filter((s) => s < score).length;
  return Math.round((below / scores.length) * 100);
}

export const VIDEO_ASSETS = ASSETS.filter((a) => a.format === "video");
export const STATIC_ASSETS = ASSETS.filter((a) => a.format === "static");

export const MEDIAN_BY_FORMAT = {
  video: medianOf(VIDEO_ASSETS.map((a) => a.score)),
  static: medianOf(STATIC_ASSETS.map((a) => a.score)),
};

export function getPercentile(asset: Asset) {
  return percentileWithin(asset.score, asset.format);
}

export const ACCOUNT_PATTERN = {
  finding: "Eleven assets have no brand mark in the top third of frame — the pattern holds across both formats.",
};
