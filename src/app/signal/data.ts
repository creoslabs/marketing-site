// Signal's data shapes. Real data comes from the analysis pipeline — see
// live-data.ts. There are no fixtures here: every screen reads live data and
// has its own empty state for the case where nothing has been analyzed yet.

export type Format = "video" | "static";
export type Verdict = "pass" | "partial" | "fail";
export type Tier = 1 | 2;

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

export type Asset = {
  id: string;
  filename: string;
  format: Format;
  platform: "TikTok" | "Instagram";
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
