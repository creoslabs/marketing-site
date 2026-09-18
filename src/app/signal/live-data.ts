import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Asset, Criterion, Format, StaticFinding, VideoFinding } from "./data";

// TEMP-PREVIEW
const DEMO_MODE = true;

const DEMO_CRITERIA: Criterion[] = [
  { name: "Aspect ratio", tier: 1, evidence: "1080×1920 (9:16), correct for the placement.", verdict: "pass" },
  { name: "Duration", tier: 1, evidence: "0:18, within platform pacing guidance.", verdict: "pass" },
  { name: "Safe-zone overlap, full runtime", tier: 1, evidence: "Caption sits inside the bottom UI band from 0:04 to 0:07.", verdict: "fail" },
  { name: "Hook window — motion detected", tier: 1, evidence: "No motion cue in the first second; slow push on a static frame.", verdict: "fail" },
  { name: "Hook window — text on screen", tier: 1, evidence: "Headline appears by 0:01, within the 4-second hook window.", verdict: "pass" },
  { name: "On-screen text coverage", tier: 1, evidence: "61% of runtime carries a text overlay.", verdict: "partial" },
  { name: "Product first appearance", tier: 2, evidence: "Product logo doesn't appear until 0:08, over 40% into the runtime.", verdict: "fail" },
  { name: "Sound-off redundancy", tier: 2, evidence: "First 8 seconds carry no captions restating spoken content.", verdict: "partial" },
  { name: "Text legibility & hold time", tier: 2, evidence: "High-contrast CTA text holds for 2+ seconds at the end card.", verdict: "pass" },
];

const DEMO_VIDEO_FINDINGS: VideoFinding[] = [
  { id: "df-1", t: 0, criterion: "Hook window — motion detected", tier: 1, failure: true, body: "The opening frame is a static hold — no motion cue for the first full second." },
  { id: "df-2", t: 1, criterion: "Hook window — text on screen", tier: 1, failure: false, body: "Headline text appears within the first second and holds through 0:03." },
  { id: "df-4", t: 4, criterion: "Safe-zone overlap, full runtime", tier: 1, failure: true, body: "Caption text sits inside the platform's bottom UI band from 0:04 to 0:07." },
  { id: "df-8", t: 8, criterion: "Product first appearance", tier: 2, failure: true, body: "The product logo and name first appear at 0:08, leaving little runtime to register the brand." },
  { id: "df-13", t: 13, criterion: "Text legibility & hold time", tier: 2, failure: false, body: "The end-card CTA uses high-contrast text and holds for the full final two seconds." },
];

const DEMO_LIBRARY: Asset[] = [
  { id: "demo-v1", filename: "ugc_routine_9x16.mp4", format: "video", platform: "TikTok", score: 51, failedChecks: 4, postedAt: "Sep 18", duration: "0:18", criteria: [], assetUrl: null },
  { id: "demo-v2", filename: "founder_story_reel.mp4", format: "video", platform: "Instagram", score: 74, failedChecks: 2, postedAt: "Sep 12", duration: "0:22", criteria: [], assetUrl: null },
  { id: "demo-v3", filename: "before_after_15s.mp4", format: "video", platform: "TikTok", score: 38, failedChecks: 6, postedAt: "Sep 6", duration: "0:15", criteria: [], assetUrl: null },
  { id: "demo-s1", filename: "bundle_promo_4x5.png", format: "static", platform: "Instagram", score: 81, failedChecks: 1, postedAt: "Sep 14", criteria: [], assetUrl: null },
  { id: "demo-s2", filename: "spf_duo_1x1.png", format: "static", platform: "Instagram", score: 76, failedChecks: 2, postedAt: "Sep 10", criteria: [], assetUrl: null },
  { id: "demo-s3", filename: "serum_hero_v3.png", format: "static", platform: "Instagram", score: 58, failedChecks: 3, postedAt: "Sep 3", criteria: [], assetUrl: null },
];

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && /^https?:\/\//.test(url));
}

function formatDuration(seconds: number) {
  return `0:${String(Math.round(seconds)).padStart(2, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function medianOf(nums: number[]) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

// Returns null when there's no real peer set to compare against yet (this
// is the only asset of its format) — showing "0th percentile" in that case
// would misleadingly read as the worst possible score rather than "no data".
export function percentileWithin(
  score: number,
  format: Format,
  assets: { score: number; format: Format }[]
): number | null {
  const scores = assets.filter((a) => a.format === format).map((a) => a.score);
  if (scores.length <= 1) return null;
  const below = scores.filter((s) => s < score).length;
  return Math.round((below / scores.length) * 100);
}

type LibraryRow = {
  id: string;
  filename: string;
  format: Format;
  platform: string | null;
  score: number | null;
  failed_checks: number | null;
  duration_seconds: number | null;
  created_at: string;
  status: string;
  storage_path: string;
};

// Signal reads from Supabase once it's configured and has at least one
// completed analysis; otherwise it shows the fixture data so the UI is
// still fully demonstrable before the pipeline is wired up.
// cache() dedupes repeat calls within one request (e.g. if a future caller
// needs the full library more than once), same reasoning as getUser().
export const getLibrary = cache(async (): Promise<{ assets: Asset[]; isLive: boolean }> => {
  if (DEMO_MODE) return { assets: DEMO_LIBRARY, isLive: true };
  if (!isSupabaseConfigured()) return { assets: [], isLive: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("signal_assets")
    .select("id, filename, format, platform, score, failed_checks, duration_seconds, created_at, status, storage_path")
    .order("created_at", { ascending: false })
    .returns<LibraryRow[]>();

  if (error || !data) return { assets: [], isLive: false };

  const doneRows = data.filter((row) => row.status === "done");
  const staticRows = doneRows.filter((row) => row.format === "static");
  const videoRows = doneRows.filter((row) => row.format === "video");

  // Statics keep their original file as the preview. Videos no longer have
  // one (the source is deleted after analysis) — one of the persisted
  // keyframes stands in as the thumbnail instead. Signed one at a time
  // (Promise.all) rather than via the batched createSignedUrls — its
  // returned path strings aren't guaranteed to match the input strings
  // byte-for-byte, which silently broke path-based matching.
  const [signedStaticUrls, { data: frameRows }] = await Promise.all([
    Promise.all(staticRows.map((row) => supabase.storage.from("signal-assets").createSignedUrl(row.storage_path, 60 * 60))),
    videoRows.length > 0
      ? supabase
          .from("signal_frames")
          .select("asset_id, t, storage_path")
          .in(
            "asset_id",
            videoRows.map((row) => row.id)
          )
          .order("t")
      : Promise.resolve({ data: [] as { asset_id: string; t: number; storage_path: string }[] }),
  ]);

  const urlByStaticPath = new Map(
    staticRows.map((row, i) => [row.storage_path, signedStaticUrls[i]?.data?.signedUrl ?? null])
  );

  // Use the earliest sampled frame (t=0) per video as its thumbnail — the
  // query below is ordered by t ascending, so frames[0] is that frame.
  const framesByAsset = new Map<string, { t: number; storage_path: string }[]>();
  for (const frame of frameRows ?? []) {
    framesByAsset.set(frame.asset_id, [...(framesByAsset.get(frame.asset_id) ?? []), frame]);
  }
  const previewFrames = [...framesByAsset.entries()].map(([assetId, frames]) => ({
    assetId,
    path: frames[0].storage_path,
  }));
  // One createSignedUrl call per frame rather than a single batched
  // createSignedUrls — the batched endpoint's returned path strings aren't
  // guaranteed to match the input strings byte-for-byte, which silently
  // broke path-based matching. Promise.all's result order is a language
  // guarantee, so pairing by array index here is actually safe.
  const signedPreviewUrls = await Promise.all(
    previewFrames.map((p) => supabase.storage.from("signal-assets").createSignedUrl(p.path, 60 * 60))
  );
  const previewUrlByAssetId = new Map(
    previewFrames.map((p, i) => [p.assetId, signedPreviewUrls[i]?.data?.signedUrl ?? null])
  );

  const assets: Asset[] = doneRows.map((row) => ({
    id: row.id,
    filename: row.filename,
    format: row.format,
    platform: (row.platform as Asset["platform"]) ?? "Instagram",
    score: row.score ?? 0,
    failedChecks: row.failed_checks ?? 0,
    postedAt: formatDate(row.created_at),
    duration: row.duration_seconds ? formatDuration(row.duration_seconds) : undefined,
    criteria: [],
    assetUrl:
      row.format === "video" ? previewUrlByAssetId.get(row.id) ?? null : urlByStaticPath.get(row.storage_path) ?? null,
  }));

  return { assets, isLive: true };
});

// For median/percentile math the caller only needs score+format, not the
// full asset objects with per-item signed preview URLs — calling the full
// getLibrary() for this (as the report page originally did) meant every
// report view paid for a signed-URL request for the *entire* library just
// to compute one number.
export const getFormatScores = cache(async (): Promise<{ score: number; format: Format }[]> => {
  if (DEMO_MODE) return DEMO_LIBRARY.map((a) => ({ score: a.score, format: a.format }));
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("signal_assets")
    .select("score, format")
    .eq("status", "done")
    .returns<{ score: number | null; format: Format }[]>();

  return (data ?? []).map((row) => ({ score: row.score ?? 0, format: row.format }));
});

// The Workspace Overview card needs only these three counts, not the full
// library — a lighter query than getLibrary() for the same reason as
// getFormatScores() above.
export const getSignalSummary = cache(
  async (): Promise<{ total: number; failing: number; lastAnalyzedAt: string | null }> => {
    if (!isSupabaseConfigured()) return { total: 0, failing: 0, lastAnalyzedAt: null };

    const supabase = await createClient();
    const { data } = await supabase
      .from("signal_assets")
      .select("failed_checks, created_at")
      .eq("status", "done")
      .order("created_at", { ascending: false })
      .returns<{ failed_checks: number | null; created_at: string }[]>();

    const rows = data ?? [];
    return {
      total: rows.length,
      failing: rows.filter((r) => (r.failed_checks ?? 0) > 0).length,
      lastAnalyzedAt: rows[0]?.created_at ?? null,
    };
  }
);

type AssetDetail = {
  asset: Asset;
  criteria: Criterion[];
  findings: VideoFinding[] | StaticFinding[];
  topFix: { title: string; clears: number; body: string };
  assetUrl: string | null;
  frames?: { t: number; url: string }[];
  durationSeconds: number | undefined;
};

// cache() dedupes this across generateMetadata and the page component,
// which both need the same asset — without it, every report view paid for
// this whole function's queries twice.
export const getAssetDetail = cache(async (id: string): Promise<AssetDetail | null> => {
  if (DEMO_MODE) {
    const asset = DEMO_LIBRARY.find((a) => a.id === id) ?? DEMO_LIBRARY[0];
    return {
      asset,
      criteria: DEMO_CRITERIA,
      findings: asset.format === "video" ? DEMO_VIDEO_FINDINGS : ([] as StaticFinding[]),
      topFix: {
        title: "Move the product logo and name into the first 2-3 seconds.",
        clears: 3,
        body: "Right now the hook window carries zero brand cues, so anyone who drops off before 0:08 never sees what's being advertised.",
      },
      assetUrl: null,
      frames: undefined,
      durationSeconds: 18,
    };
  }
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: assetRow } = await supabase.from("signal_assets").select("*").eq("id", id).eq("status", "done").single();
  if (!assetRow) return null;

  const isVideo = assetRow.format === "video";

  // Independent of each other once assetRow is known — run together instead
  // of waterfalling sequential round-trips. Videos no longer have a source
  // file to sign (deleted after analysis) — they get their persisted
  // keyframes instead; statics still sign their one original file.
  const [{ data: criteriaRows }, { data: findingRows }, { data: signedUrlData }, { data: frameRows }] = await Promise.all([
    supabase.from("signal_criteria").select("*").eq("asset_id", id).order("sort_order"),
    supabase.from("signal_findings").select("*").eq("asset_id", id).order("sort_order"),
    isVideo
      ? Promise.resolve({ data: null })
      : supabase.storage.from("signal-assets").createSignedUrl(assetRow.storage_path, 60 * 60),
    isVideo
      ? supabase.from("signal_frames").select("t, storage_path").eq("asset_id", id).order("t")
      : Promise.resolve({ data: [] as { t: number; storage_path: string }[] }),
  ]);

  let frames: { t: number; url: string }[] | undefined;
  if (isVideo && frameRows && frameRows.length > 0) {
    // One createSignedUrl call per frame, not the batched createSignedUrls —
    // see getLibrary() above for why the batched endpoint's path-matching
    // can't be trusted.
    const signedFrameUrls = await Promise.all(
      frameRows.map((f) => supabase.storage.from("signal-assets").createSignedUrl(f.storage_path, 60 * 60))
    );
    frames = frameRows
      .map((f, i) => ({ t: f.t, url: signedFrameUrls[i]?.data?.signedUrl ?? "" }))
      .filter((f) => f.url);
  }

  const asset: Asset = {
    id: assetRow.id,
    filename: assetRow.filename,
    format: assetRow.format,
    platform: assetRow.platform ?? "Instagram",
    score: assetRow.score ?? 0,
    failedChecks: assetRow.failed_checks ?? 0,
    postedAt: formatDate(assetRow.created_at),
    duration: assetRow.duration_seconds ? formatDuration(assetRow.duration_seconds) : undefined,
    criteria: [],
  };

  const criteria: Criterion[] = (criteriaRows ?? []).map((r) => ({
    name: r.name,
    tier: r.tier,
    evidence: r.evidence,
    verdict: r.verdict,
  }));

  const topFix = {
    title: assetRow.top_fix_title ?? "",
    clears: assetRow.top_fix_clears ?? 0,
    body: assetRow.top_fix_body ?? "",
  };

  const findings =
    assetRow.format === "video"
      ? ((findingRows ?? []).map((r) => ({
          id: r.id,
          t: r.t,
          criterion: r.criterion_name,
          tier: r.tier,
          failure: r.failure,
          body: r.body,
        })) as VideoFinding[])
      : ((findingRows ?? []).map((r) => ({
          id: r.id,
          marker: r.marker,
          criterion: r.criterion_name,
          tier: r.tier,
          body: r.body,
          region: { top: r.region_top, left: r.region_left, width: r.region_width, height: r.region_height },
        })) as StaticFinding[]);

  return {
    asset,
    criteria,
    findings,
    topFix,
    assetUrl: signedUrlData?.signedUrl ?? null,
    frames,
    durationSeconds: assetRow.duration_seconds ?? undefined,
  };
});
