import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Asset, Criterion, Format, StaticFinding, VideoFinding } from "./data";

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
  // keyframes stands in as the thumbnail instead.
  const [{ data: signedStaticUrls }, { data: frameRows }] = await Promise.all([
    staticRows.length > 0
      ? supabase.storage.from("signal-assets").createSignedUrls(
          staticRows.map((row) => row.storage_path),
          60 * 60
        )
      : Promise.resolve({ data: [] as { path: string; signedUrl: string }[] }),
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

  const urlByStaticPath = new Map((signedStaticUrls ?? []).map((s) => [s.path, s.signedUrl]));

  // Pick the middle sampled frame per video as its representative thumbnail.
  const framesByAsset = new Map<string, { t: number; storage_path: string }[]>();
  for (const frame of frameRows ?? []) {
    framesByAsset.set(frame.asset_id, [...(framesByAsset.get(frame.asset_id) ?? []), frame]);
  }
  const previewFrames = [...framesByAsset.entries()].map(([assetId, frames]) => ({
    assetId,
    path: frames[Math.floor(frames.length / 2)].storage_path,
  }));
  const { data: signedFrameUrls } =
    previewFrames.length > 0
      ? await supabase.storage.from("signal-assets").createSignedUrls(
          previewFrames.map((p) => p.path),
          60 * 60
        )
      : { data: [] as { path: string; signedUrl: string }[] };
  const previewUrlByAssetId = new Map(
    previewFrames.map((p, i) => [p.assetId, signedFrameUrls?.[i]?.signedUrl ?? null])
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
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("signal_assets")
    .select("score, format")
    .eq("status", "done")
    .returns<{ score: number | null; format: Format }[]>();

  return (data ?? []).map((row) => ({ score: row.score ?? 0, format: row.format }));
});

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
    const { data: signedFrameUrls } = await supabase.storage.from("signal-assets").createSignedUrls(
      frameRows.map((f) => f.storage_path),
      60 * 60
    );
    frames = frameRows.map((f, i) => ({ t: f.t, url: signedFrameUrls?.[i]?.signedUrl ?? "" })).filter((f) => f.url);
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
