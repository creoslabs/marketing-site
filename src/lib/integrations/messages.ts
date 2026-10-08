import type { SupabaseClient } from "@supabase/supabase-js";
import { appLink } from "./links";
import type { DeliveryItem, DeliveryPayload } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this project doesn't generate a Database type for the Supabase client.
type Admin = SupabaseClient<any>;

const THUMB_TTL_SECONDS = 14 * 24 * 60 * 60;

function isoDate(d: Date = new Date()) {
  return d.toISOString().slice(0, 10);
}

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function stripExtension(name: string) {
  return name.replace(/\.[a-z0-9]{2,5}$/i, "");
}

function formatMultiple(multiple: number) {
  return `${multiple >= 10 ? Math.round(multiple) : multiple.toFixed(1)}×`;
}

// A scorecard for a finished Signal analysis: thumbnail, overall score,
// pass/partial/fail counts, top three fails, link back to the report.
export async function buildScorecardPayload(
  admin: Admin,
  userId: string,
  assetId: string,
  opts?: { competitor?: boolean; daysRunning?: number | null }
): Promise<DeliveryPayload | null> {
  const { data: asset } = await admin
    .from("signal_assets")
    .select("id, filename, format, score, status, storage_path, created_at")
    .eq("id", assetId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!asset || asset.status !== "done" || asset.score === null) return null;

  const { data: criteria } = await admin
    .from("signal_criteria")
    .select("name, verdict, sort_order")
    .eq("asset_id", assetId)
    .order("sort_order", { ascending: true });
  const list = criteria ?? [];
  const pass = list.filter((c) => c.verdict === "pass").length;
  const partial = list.filter((c) => c.verdict === "partial").length;
  const failNames = list.filter((c) => c.verdict === "fail").map((c) => c.name as string);

  let thumbnailUrl: string | null = null;
  try {
    let path: string | null = null;
    if (asset.format === "video") {
      const { data: frame } = await admin.from("signal_frames").select("storage_path").eq("asset_id", assetId).order("t", { ascending: true }).limit(1).maybeSingle();
      path = (frame?.storage_path as string | undefined) ?? null;
    } else {
      path = asset.storage_path as string;
    }
    if (path) {
      const { data: signed } = await admin.storage.from("signal-assets").createSignedUrl(path, THUMB_TTL_SECONDS);
      thumbnailUrl = signed?.signedUrl ?? null;
    }
  } catch {
    thumbnailUrl = null;
  }

  const name = stripExtension(asset.filename as string);
  const link = appLink("signal", `/report/${assetId}`);
  const lines = [`${pass} pass · ${partial} partial · ${failNames.length} fail`];
  if (failNames.length > 0) lines.push(`Top fails: ${failNames.slice(0, 3).join(" · ")}`);
  if (opts?.competitor && opts.daysRunning) lines.push(`Running ${opts.daysRunning} day${opts.daysRunning === 1 ? "" : "s"}`);

  return {
    event: opts?.competitor ? "competitor_scored" : "scorecard_completed",
    product: "signal",
    title: opts?.competitor ? "Competitor ad scored" : "Scorecard ready",
    headline: `${opts?.competitor ? "Competitor · " : ""}${name} · Score ${asset.score}/100`,
    lines,
    thumbnailUrl,
    href: link,
    ctaLabel: "Open in Signal",
    row: { date: isoDate(new Date(asset.created_at as string)), product: "Signal", item: `${opts?.competitor ? "Competitor · " : ""}${name}`, score: asset.score as number, link },
  };
}

type TranscriptLine = { text: string; isHook?: boolean };

// An Outlier alert for one post: creator, thumbnail, how far above their
// median, the hook line from the transcript (caption if not analysed yet).
export async function buildOutlierPayload(admin: Admin, userId: string, postId: string): Promise<DeliveryPayload | null> {
  const { data: post } = await admin
    .from("outlier_posts")
    .select("id, handle_id, views, caption, thumbnail_url, transcript, posted_at")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return null;
  const { data: handle } = await admin.from("outlier_handles").select("id, handle, platform, creator_id, user_id").eq("id", post.handle_id).maybeSingle();
  if (!handle || handle.user_id !== userId) return null;

  const { data: siblings } = await admin.from("outlier_posts").select("views").eq("handle_id", handle.id);
  const views = (siblings ?? []).map((r) => Number(r.views)).sort((a, b) => a - b);
  const median = views.length === 0 ? 0 : views.length % 2 === 0 ? (views[views.length / 2 - 1] + views[views.length / 2]) / 2 : views[(views.length - 1) / 2];
  if (median <= 0) return null;
  const multiple = Number(post.views) / median;

  const transcript = (post.transcript ?? null) as TranscriptLine[] | null;
  const hook = transcript?.find((l) => l.isHook)?.text ?? transcript?.[0]?.text ?? null;
  const hookLine = hook ? `Hook: “${truncate(hook, 140)}”` : post.caption ? `Caption: ${truncate(post.caption as string, 140)}` : null;

  const link = appLink("outlier", `/video/${postId}`);
  const lines = [`@${handle.handle} · ${Number(post.views).toLocaleString("en-US")} views vs ${Math.round(median).toLocaleString("en-US")} median`];
  if (hookLine) lines.push(hookLine);

  return {
    event: "outlier_detected",
    product: "outlier",
    title: "Outlier detected",
    headline: `${formatMultiple(multiple)} their median`,
    lines,
    thumbnailUrl: (post.thumbnail_url as string | null) ?? null,
    href: link,
    ctaLabel: "Open in Outlier",
    row: { date: isoDate(), product: "Outlier", item: `@${handle.handle} · ${truncate((post.caption as string | null) ?? "Untitled post", 80)}`, score: Math.round(multiple * 10) / 10, link },
  };
}

// The weekly digest for one user: top outliers across the watchlist from the
// last seven days, with links. Null when there is nothing worth sending.
export async function buildWeeklyDigest(admin: Admin, userId: string): Promise<DeliveryPayload | null> {
  const { data: handles } = await admin.from("outlier_handles").select("id, handle").eq("user_id", userId);
  if (!handles || handles.length === 0) return null;
  const handleName = new Map(handles.map((h) => [h.id as string, h.handle as string]));
  const ids = [...handleName.keys()];

  const { data: posts } = await admin.from("outlier_posts").select("id, handle_id, views, caption, thumbnail_url, posted_at").in("handle_id", ids);
  if (!posts || posts.length === 0) return null;

  const byHandle = new Map<string, number[]>();
  for (const p of posts) byHandle.set(p.handle_id as string, [...(byHandle.get(p.handle_id as string) ?? []), Number(p.views)]);
  const medianOf = (nums: number[]) => {
    const s = [...nums].sort((a, b) => a - b);
    return s.length === 0 ? 0 : s.length % 2 === 0 ? (s[s.length / 2 - 1] + s[s.length / 2]) / 2 : s[(s.length - 1) / 2];
  };

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const items = posts
    .filter((p) => new Date(p.posted_at as string).getTime() >= weekAgo)
    .map((p) => {
      const median = medianOf(byHandle.get(p.handle_id as string) ?? []);
      return { post: p, multiple: median > 0 ? Number(p.views) / median : 0 };
    })
    .filter((x) => x.multiple >= 2)
    .sort((a, b) => b.multiple - a.multiple)
    .slice(0, 8);
  if (items.length === 0) return null;

  const digestItems: DeliveryItem[] = items.map(({ post, multiple }) => ({
    headline: `${formatMultiple(multiple)} · @${handleName.get(post.handle_id as string)}`,
    detail: post.caption ? truncate(post.caption as string, 90) : undefined,
    href: appLink("outlier", `/video/${post.id}`),
    thumbnailUrl: (post.thumbnail_url as string | null) ?? null,
  }));
  const link = appLink("outlier", "/feed");

  return {
    event: "weekly_digest",
    product: "outlier",
    title: "Weekly outlier digest",
    headline: `${items.length} outlier${items.length === 1 ? "" : "s"} across your watchlist this week`,
    lines: [],
    href: link,
    ctaLabel: "Open feed in Outlier",
    items: digestItems,
    row: { date: isoDate(), product: "Outlier", item: "Weekly outlier digest", score: items.length, link },
  };
}

export function sampleTestPayload(): DeliveryPayload {
  const link = appLink("signal", "/");
  return {
    event: "test",
    product: "signal",
    title: "Test message",
    headline: "Summer Sale – 15s vertical · Score 72/100",
    lines: ["9 pass · 4 partial · 3 fail", "Top fails: no hook in first 2s · text in bottom safe zone · no captions", "This is a sample sent from Manage — nothing was scored."],
    href: link,
    ctaLabel: "Open in Signal",
    row: { date: isoDate(), product: "Signal", item: "Test message — sample scorecard (safe to delete)", score: 72, link },
  };
}
