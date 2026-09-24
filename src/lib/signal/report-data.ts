import type { Asset, Criterion, StaticFinding, VideoFinding } from "@/app/signal/data";

// The data contract signal-report-template/README.md documents, unchanged —
// this is what src/lib/signal/report-html.ts renders.
export type ReportStatus = "pass" | "partial" | "fail";

export type ReportBand = {
  top: number;
  height: number;
  tone: "info" | "danger" | "hatch";
  bordered?: boolean;
  strong?: boolean;
  label: string;
};

export type ReportPanel = {
  caption: string;
  frames: { timestamp: string; bands: ReportBand[] }[];
  legend: { tone: "info" | "danger" | "hatch"; label: string }[];
  note: string;
};

export type ReportCriterionRow = {
  name: string;
  status: ReportStatus;
  detail: string;
  panel?: ReportPanel;
};

export type ReportTier = { label: string; rows: ReportCriterionRow[] };

export type ReportTimelineMark = { timestamp: string; position: number; status: ReportStatus; row: 0 | 1 };

export type ReportFinding = { timestamp: string; tier: string; title: string; detail: string };

export type ReportData = {
  accent?: string;
  product_name?: string;
  file: { name: string; format_tag: string; platform: string; date: string; aspect_label: string };
  score: {
    value: number;
    pass_count: number;
    partial_count: number;
    fail_count: number;
    median: number;
    percentile_label: string;
  };
  tier1: ReportTier;
  tier2: ReportTier;
  findings_timeline: ReportTimelineMark[];
  findings: ReportFinding[];
  top_fix: { headline: string; body: string; checklist: string[] };
};

// What the report page (video-report.tsx / static-report.tsx) already
// assembles for the export button — the shape of Signal's own scoring
// result, not the template's contract. buildReportData() below maps one to
// the other; the report pages themselves don't need to know the template
// exists.
export type PdfReportData = {
  asset: Asset;
  criteria: Criterion[];
  findings: VideoFinding[] | StaticFinding[];
  topFix: { title: string; clears: number; criteria: string[]; body: string };
  median: number;
  percentile: number | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number;
};

function formatTimestamp(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Never fabricate (per the template README's own design discipline): a
// `panel` (the safe-zone frame map) is omitted entirely rather than guessed,
// since Signal's pipeline only reports two intrusion percentages, not the
// per-region breakdown with labels the panel needs.
export function buildReportData(data: PdfReportData): ReportData {
  const { asset, criteria, findings, topFix, median, percentile, durationSeconds } = data;
  const isVideo = asset.format === "video";

  const pass = criteria.filter((c) => c.verdict === "pass").length;
  const partial = criteria.filter((c) => c.verdict === "partial").length;
  const fail = criteria.filter((c) => c.verdict === "fail").length;

  const toRow = (c: Criterion): ReportCriterionRow => ({ name: c.name, status: c.verdict, detail: c.evidence });
  const tier1 = criteria.filter((c) => c.tier === 1).map(toRow);
  const tier2 = criteria.filter((c) => c.tier === 2).map(toRow);

  const percentileLabel =
    percentile === null
      ? `First ${asset.format} analyzed in this set — not comparable across formats.`
      : `${percentile}th percentile among ${isVideo ? "videos" : "statics"} in this set`;

  let findingsTimeline: ReportTimelineMark[] = [];
  let findingRows: ReportFinding[] = [];

  if (isVideo) {
    const videoFindings = findings as VideoFinding[];
    const duration = durationSeconds && durationSeconds > 0 ? durationSeconds : Math.max(1, ...videoFindings.map((f) => f.t), 1);
    findingsTimeline = videoFindings.map((f, i) => ({
      timestamp: formatTimestamp(f.t),
      position: Math.min(100, Math.round((f.t / duration) * 100)),
      // VideoFinding only tracks a boolean failure, not a three-way verdict —
      // mapping to pass/fail (never a fabricated "partial") stays honest to
      // what's actually captured per finding.
      status: f.failure ? "fail" : "pass",
      row: (i % 2) as 0 | 1,
    }));
    findingRows = videoFindings.map((f) => ({
      timestamp: formatTimestamp(f.t),
      tier: `Tier ${f.tier}`,
      title: f.criterion,
      detail: f.body,
    }));
  } else {
    const staticFindings = findings as StaticFinding[];
    findingRows = staticFindings.map((f) => ({
      timestamp: f.marker.toUpperCase(),
      tier: `Tier ${f.tier}`,
      title: f.criterion,
      detail: f.body,
    }));
  }

  return {
    product_name: "Signal",
    file: {
      name: asset.filename,
      format_tag: isVideo ? `VIDEO · ${asset.duration ?? ""} · 9:16` : "STATIC · 4:5",
      platform: asset.platforms.join(" + "),
      date: asset.postedAt,
      aspect_label: isVideo ? "9:16" : "4:5",
    },
    score: {
      value: Math.round(asset.score),
      pass_count: pass,
      partial_count: partial,
      fail_count: fail,
      median: Math.round(median),
      percentile_label: percentileLabel,
    },
    tier1: { label: "Tier 1 · Structural", rows: tier1 },
    tier2: { label: "Tier 2 · Contextual", rows: tier2 },
    findings_timeline: findingsTimeline,
    findings: findingRows,
    top_fix: { headline: topFix.title, body: topFix.body, checklist: topFix.criteria },
  };
}
