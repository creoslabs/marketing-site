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
export async function getLibrary(): Promise<{ assets: Asset[]; isLive: boolean }> {
  if (!isSupabaseConfigured()) return { assets: [], isLive: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("signal_assets")
    .select("id, filename, format, platform, score, failed_checks, duration_seconds, created_at, status, storage_path")
    .order("created_at", { ascending: false })
    .returns<LibraryRow[]>();

  if (error || !data) return { assets: [], isLive: false };

  const doneRows = data.filter((row) => row.status === "done");

  // One batched signed-URL request for every asset's preview, rather than
  // one round-trip per card.
  const { data: signedUrls } = await supabase.storage
    .from("signal-assets")
    .createSignedUrls(
      doneRows.map((row) => row.storage_path),
      60 * 60
    );
  const urlByPath = new Map((signedUrls ?? []).map((s) => [s.path, s.signedUrl]));

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
    assetUrl: urlByPath.get(row.storage_path) ?? null,
  }));

  return { assets, isLive: true };
}

type AssetDetail = {
  asset: Asset;
  criteria: Criterion[];
  findings: VideoFinding[] | StaticFinding[];
  topFix: { title: string; clears: number; body: string };
  assetUrl: string | null;
  durationSeconds: number | undefined;
};

export async function getAssetDetail(id: string): Promise<AssetDetail | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: assetRow } = await supabase.from("signal_assets").select("*").eq("id", id).eq("status", "done").single();
  if (!assetRow) return null;

  const { data: criteriaRows } = await supabase
    .from("signal_criteria")
    .select("*")
    .eq("asset_id", id)
    .order("sort_order");

  const { data: findingRows } = await supabase
    .from("signal_findings")
    .select("*")
    .eq("asset_id", id)
    .order("sort_order");

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

  // Signed, since the bucket is private — the RLS storage policy already
  // lets this user read their own object, this just gets a browser-usable
  // URL out of it. An hour is plenty for one report view.
  const { data: signedUrlData } = await supabase.storage
    .from("signal-assets")
    .createSignedUrl(assetRow.storage_path, 60 * 60);

  return {
    asset,
    criteria,
    findings,
    topFix,
    assetUrl: signedUrlData?.signedUrl ?? null,
    durationSeconds: assetRow.duration_seconds ?? undefined,
  };
}
