// Signal's data shapes. Real data comes from the analysis pipeline — see
// live-data.ts. There are no fixtures here: every screen reads live data and
// has its own empty state for the case where nothing has been analyzed yet.

export type Format = "video" | "static";
export type Verdict = "pass" | "partial" | "fail";
export type Tier = 1 | 2;
// Facebook and Instagram share one placement/safe-zone standard for Reels
// and Stories, so they're one "Meta" bucket rather than two — TikTok's UI
// chrome (caption/CTA cluster, icon rail) sits differently, which is the
// one criterion (safe-zone overlap) that actually varies by platform today.
export type Platform = "TikTok" | "Meta";

// Safe-zone overlap is the one criterion whose verdict depends on which
// platform an asset targets — kept here (not in lib/signal/criteria.ts,
// which pulls in node-only ffmpeg tooling) so client components can name it
// without bundling server-only code.
export const SAFE_ZONE_CRITERION_NAME: Record<Format, string> = {
  video: "Safe-zone overlap across full runtime",
  static: "Safe-zone overlap",
};

// Approximate, publicly-documented safe-zone margins for each platform's own
// UI chrome — Meta's Reels/Stories overlay (caption + CTA, lower-right icon
// rail) vs TikTok's (heavier bottom caption/music/CTA cluster, right-side
// icon rail).
export const SAFE_ZONE_THRESHOLDS: Record<Platform, { topPct: number; bottomPct: number }> = {
  Meta: { topPct: 15, bottomPct: 20 },
  TikTok: { topPct: 8, bottomPct: 24 },
};

export type Criterion = {
  name: string;
  tier: Tier;
  evidence: string;
  verdict: Verdict;
};

export type VideoFinding = {
  id: string;
  t: number;
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

// Rolled up across every signal_criteria row with verdict 'fail' in the
// user's library. Criteria names come from a small fixed list (see
// VIDEO_JUDGED_CRITERIA/STATIC_JUDGED_CRITERIA in lib/signal/claude.ts),
// not free text, so an exact-match count is a real, honest aggregation —
// no LLM clustering pass needed, unlike Outlier's free-text hook tags.
export type FailureTheme = { name: string; tier: Tier; count: number };

// A run of consecutive most-recent uploads (of that criterion's own
// format) that all failed the same criterion — distinct from a cumulative
// count, which can't tell "failed 5 times scattered across 20 uploads"
// apart from "failed your last 5 in a row."
export type FailureStreak = { name: string; tier: Tier; streak: number };

export type Asset = {
  id: string;
  filename: string;
  format: Format;
  // platforms[0] is the "primary" platform — its score/criteria are what
  // score/failedChecks below represent. Additional platforms' scores live
  // in PlatformScore rows (see AssetDetail in live-data.ts).
  platforms: Platform[];
  score: number;
  failedChecks: number;
  postedAt: string;
  // Raw ISO timestamp of when analysis completed — for recency-based
  // insights and activity feeds (postedAt above is a display string only).
  createdAtIso: string;
  duration?: string;
  issuePill?: string;
  criteria: Criterion[];
  assetUrl?: string | null;
};

// A placement beyond the primary one this asset was scored against — its
// own full criteria set, re-judged wherever a criterion depends on platform
// (duration, hook-window timing, cut pace, safe zone — see criteria.ts).
export type PlatformScore = {
  platform: Platform;
  score: number;
  failedChecks: number;
  criteria: Criterion[];
};
