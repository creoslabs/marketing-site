import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Asset, Criterion, FailureStreak, FailureTheme, Format, Platform, PlatformScore, StaticFinding, VideoFinding } from "./data";

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

// Same reasoning and threshold as Outlier's computeMedianTrend: fewer than
// six assets isn't enough to trust a "recent half vs older half" split, so
// this returns null (shown as "not enough history yet") rather than a
// trend that's really just noise from one or two assets.
export function computeScoreTrend(scoresMostRecentFirst: number[]): number | null {
  if (scoresMostRecentFirst.length < 6) return null;
  const half = Math.floor(scoresMostRecentFirst.length / 2);
  const recentMedian = medianOf(scoresMostRecentFirst.slice(0, half));
  const olderMedian = medianOf(scoresMostRecentFirst.slice(half));
  if (olderMedian === 0) return null;
  return Math.round(((recentMedian - olderMedian) / olderMedian) * 100);
}

type LibraryRow = {
  id: string;
  filename: string;
  format: Format;
  platforms: Platform[] | null;
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
    .select("id, filename, format, platforms, score, failed_checks, duration_seconds, created_at, status, storage_path")
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
    platforms: row.platforms && row.platforms.length > 0 ? row.platforms : ["Meta"],
    score: row.score ?? 0,
    failedChecks: row.failed_checks ?? 0,
    postedAt: formatDate(row.created_at),
    createdAtIso: row.created_at,
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

type VersionLink = { id: string; filename: string; score: number };

type AssetDetail = {
  asset: Asset;
  criteria: Criterion[];
  // Only present for platforms beyond the primary one (asset.platforms[0]) —
  // the primary's score/criteria are already on `asset`/`criteria` above.
  platformScores: PlatformScore[];
  findings: VideoFinding[] | StaticFinding[];
  topFix: { title: string; clears: number; criteria: string[]; body: string };
  assetUrl: string | null;
  frames?: { t: number; url: string }[];
  durationSeconds: number | undefined;
  // A simple predecessor/successor link, not a full version tree — "what
  // did I try right before this" is the useful question here.
  previousVersion: VersionLink | null;
  nextVersion: VersionLink | null;
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
  const [{ data: criteriaRows }, { data: findingRows }, { data: signedUrlData }, { data: frameRows }, { data: platformScoreRows }] =
    await Promise.all([
      supabase.from("signal_criteria").select("*").eq("asset_id", id).order("sort_order"),
      supabase.from("signal_findings").select("*").eq("asset_id", id).order("sort_order"),
      isVideo
        ? Promise.resolve({ data: null })
        : supabase.storage.from("signal-assets").createSignedUrl(assetRow.storage_path, 60 * 60),
      isVideo
        ? supabase.from("signal_frames").select("t, storage_path").eq("asset_id", id).order("t")
        : Promise.resolve({ data: [] as { t: number; storage_path: string }[] }),
      supabase.from("signal_platform_scores").select("*").eq("asset_id", id),
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
    platforms: assetRow.platforms && assetRow.platforms.length > 0 ? assetRow.platforms : ["Meta"],
    score: assetRow.score ?? 0,
    failedChecks: assetRow.failed_checks ?? 0,
    postedAt: formatDate(assetRow.created_at),
    createdAtIso: assetRow.created_at,
    duration: assetRow.duration_seconds ? formatDuration(assetRow.duration_seconds) : undefined,
    criteria: [],
  };

  // Only the additional (non-primary) platforms are surfaced here — the
  // primary's own row duplicates asset.score/failedChecks/criteria above.
  const platformScores: PlatformScore[] = (platformScoreRows ?? [])
    .filter((r) => r.platform !== asset.platforms[0])
    .map((r) => ({
      platform: r.platform,
      score: r.score,
      failedChecks: r.failed_checks,
      criteria: r.criteria,
    }));

  const criteria: Criterion[] = (criteriaRows ?? []).map((r) => ({
    name: r.name,
    tier: r.tier,
    evidence: r.evidence,
    verdict: r.verdict,
  }));

  const topFix = {
    title: assetRow.top_fix_title ?? "",
    clears: assetRow.top_fix_clears ?? 0,
    criteria: assetRow.top_fix_criteria ?? [],
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

  const [{ data: previousRow }, { data: nextRow }] = await Promise.all([
    assetRow.revision_of
      ? supabase.from("signal_assets").select("id, filename, score").eq("id", assetRow.revision_of).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("signal_assets").select("id, filename, score").eq("revision_of", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const previousVersion: VersionLink | null = previousRow ? { id: previousRow.id, filename: previousRow.filename, score: previousRow.score ?? 0 } : null;
  const nextVersion: VersionLink | null = nextRow ? { id: nextRow.id, filename: nextRow.filename, score: nextRow.score ?? 0 } : null;

  return {
    asset,
    criteria,
    platformScores,
    findings,
    topFix,
    assetUrl: signedUrlData?.signedUrl ?? null,
    frames,
    durationSeconds: assetRow.duration_seconds ?? undefined,
    previousVersion,
    nextVersion,
  };
});

// Only the top few most-frequent failures, and only ones that have failed
// more than once — a single failure isn't a "recurring" theme, it's just
// one asset's report.
const MIN_RECURRING_FAILURES = 2;

export const getFailureThemes = cache(async (): Promise<FailureTheme[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("signal_criteria")
    .select("name, tier")
    .eq("verdict", "fail")
    .returns<{ name: string; tier: 1 | 2 }[]>();

  const counts = new Map<string, FailureTheme>();
  for (const row of data ?? []) {
    const existing = counts.get(row.name);
    if (existing) existing.count += 1;
    else counts.set(row.name, { name: row.name, tier: row.tier, count: 1 });
  }

  return [...counts.values()]
    .filter((t) => t.count >= MIN_RECURRING_FAILURES)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
});

// The inverse of failure themes: what your above-median-scoring assets
// consistently nail. Restricted to above-median assets (not the whole
// library) so this reads as "what your best work does right," not just
// "what passes most often across everything" — most criteria pass most of
// the time regardless of asset quality, so unfiltered pass counts wouldn't
// say much.
export const getRecurringPasses = cache(async (): Promise<FailureTheme[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data: assets } = await supabase
    .from("signal_assets")
    .select("id, score")
    .eq("status", "done")
    .returns<{ id: string; score: number | null }[]>();
  const scored = (assets ?? []).filter((a): a is { id: string; score: number } => a.score !== null);
  if (scored.length === 0) return [];

  const med = medianOf(scored.map((a) => a.score));
  const topAssetIds = scored.filter((a) => a.score >= med).map((a) => a.id);
  if (topAssetIds.length === 0) return [];

  const { data } = await supabase
    .from("signal_criteria")
    .select("name, tier")
    .eq("verdict", "pass")
    .in("asset_id", topAssetIds)
    .returns<{ name: string; tier: 1 | 2 }[]>();

  const counts = new Map<string, FailureTheme>();
  for (const row of data ?? []) {
    const existing = counts.get(row.name);
    if (existing) existing.count += 1;
    else counts.set(row.name, { name: row.name, tier: row.tier, count: 1 });
  }

  return [...counts.values()]
    .filter((t) => t.count >= MIN_RECURRING_FAILURES)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
});

const MIN_STREAK = 3;

// Walks each criterion backward from the most recent asset it applies to
// (skipping assets of a different format, since a criterion is
// format-specific) and stops counting the moment it hits anything other
// than a fail — a real "in a row," not just a high total.
export const getFailureStreaks = cache(async (): Promise<FailureStreak[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data: assets } = await supabase
    .from("signal_assets")
    .select("id, created_at")
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .returns<{ id: string; created_at: string }[]>();
  if (!assets || assets.length === 0) return [];
  const assetOrder = new Map(assets.map((a, i) => [a.id, i]));

  const { data: criteriaRows } = await supabase
    .from("signal_criteria")
    .select("name, tier, verdict, asset_id")
    .in(
      "asset_id",
      assets.map((a) => a.id)
    )
    .returns<{ name: string; tier: 1 | 2; verdict: string; asset_id: string }[]>();

  const byName = new Map<string, { tier: 1 | 2; verdictByIndex: Map<number, string> }>();
  for (const row of criteriaRows ?? []) {
    const idx = assetOrder.get(row.asset_id);
    if (idx === undefined) continue;
    let entry = byName.get(row.name);
    if (!entry) {
      entry = { tier: row.tier, verdictByIndex: new Map() };
      byName.set(row.name, entry);
    }
    entry.verdictByIndex.set(idx, row.verdict);
  }

  const streaks: FailureStreak[] = [];
  for (const [name, { tier, verdictByIndex }] of byName) {
    let streak = 0;
    for (let i = 0; i < assets.length; i++) {
      const verdict = verdictByIndex.get(i);
      if (verdict === undefined) continue; // a different-format asset — doesn't break the streak, just isn't part of it
      if (verdict === "fail") streak += 1;
      else break;
    }
    if (streak >= MIN_STREAK) streaks.push({ name, tier, streak });
  }

  return streaks.sort((a, b) => b.streak - a.streak).slice(0, 3);
});
