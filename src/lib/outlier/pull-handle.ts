import type { SupabaseClient } from "@supabase/supabase-js";
import { getApifyToken, pullTikTok, pullInstagram, pullYouTube } from "./apify";
import { analyzeOutlierPost } from "./analyze-post";

function medianOf(nums: number[]) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

export type HandleToPull = { id: string; user_id: string; platform: "TT" | "IG" | "YT"; handle: string };
export type PullApiKeys = { apifyKey?: string | null; groqKey?: string | null; anthropicKey?: string | null };
export type PullOutcome = { ok: true; newCount: number; totalPulled: number; autoAnalyzed: string | null } | { ok: false; error: string };

// The full pull pipeline for one handle — fetch via Apify, upsert posts,
// auto-analyze the best new outlier, and record a job + notification.
// Shared by the interactive "Pull now" route and the scheduled cron route
// so both behave identically and stay in sync.
export async function pullHandle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this project doesn't generate a Database type for the Supabase client.
  admin: SupabaseClient<any>,
  handle: HandleToPull,
  apiKeys: PullApiKeys,
  postLimit = 30
): Promise<PullOutcome> {
  const { data: jobRow } = await admin
    .from("outlier_jobs")
    .insert({ user_id: handle.user_id, handle_id: handle.id, state: "running", stage: "Pulling posts…" })
    .select("id")
    .single();
  const jobId = jobRow?.id as string | undefined;

  await admin.from("outlier_handles").update({ status: "pulling", error: null }).eq("id", handle.id);

  try {
    const token = getApifyToken(apiKeys.apifyKey);

    const { posts: rawPosts, avatarUrl } =
      handle.platform === "TT"
        ? await pullTikTok(handle.handle, token, postLimit)
        : handle.platform === "IG"
          ? await pullInstagram(handle.handle, token, postLimit)
          : await pullYouTube(handle.handle, token, postLimit);

    const { data: existing } = await admin.from("outlier_posts").select("external_id").eq("handle_id", handle.id);
    const existingIds = new Set((existing ?? []).map((r) => r.external_id));
    const newCount = rawPosts.filter((p) => !existingIds.has(p.externalId)).length;

    if (avatarUrl) {
      await admin.from("outlier_handles").update({ avatar_url: avatarUrl }).eq("id", handle.id);
    }

    if (rawPosts.length > 0) {
      const { error: upsertError } = await admin.from("outlier_posts").upsert(
        rawPosts.map((p) => ({
          handle_id: handle.id,
          external_id: p.externalId,
          platform: handle.platform,
          caption: p.caption,
          url: p.url,
          video_url: p.videoUrl,
          thumbnail_url: p.thumbnailUrl,
          views: p.views,
          likes: p.likes,
          comments: p.comments,
          shares: p.shares,
          saves: p.saves,
          followers: p.followers,
          duration_seconds: p.durationSeconds,
          posted_at: p.postedAt,
        })),
        { onConflict: "handle_id,external_id" }
      );
      if (upsertError) throw new Error(upsertError.message);
    }

    await admin
      .from("outlier_handles")
      .update({ status: "active", last_pulled_at: new Date().toISOString(), error: null })
      .eq("id", handle.id);

    if (jobId) {
      await admin
        .from("outlier_jobs")
        .update({ state: "done", new_posts_count: newCount, finished_at: new Date().toISOString() })
        .eq("id", jobId);
    }

    // Auto-analyze the single best new outlier — analyzing every pulled
    // post (or even every new one) would multiply download+transcribe+
    // Claude cost across a whole pull for posts nobody will ever look at,
    // and could easily blow well past this request's time budget. The rest
    // stay one click away via the manual "Transcribe & analyze" button.
    let autoAnalyzed: string | null = null;
    const { data: allPostRows } = await admin
      .from("outlier_posts")
      .select("id, external_id, caption, url, video_url, duration_seconds, views")
      .eq("handle_id", handle.id);
    const median = medianOf((allPostRows ?? []).map((r) => r.views));
    const bestNew = (allPostRows ?? [])
      .filter((r) => !existingIds.has(r.external_id) && handle.platform !== "YT" && median > 0 && r.views / median >= 2)
      .sort((a, b) => b.views - a.views)[0];

    if (bestNew) {
      const result = await analyzeOutlierPost({
        admin,
        post: { ...bestNew, platform: handle.platform },
        userApifyKey: apiKeys.apifyKey,
        userGroqKey: apiKeys.groqKey,
        userAnthropicKey: apiKeys.anthropicKey,
      });
      if (result.ok) autoAnalyzed = bestNew.id;
    }

    await admin.from("notifications").insert({
      user_id: handle.user_id,
      title: `Pulled @${handle.handle}`,
      body: autoAnalyzed
        ? `${newCount} new post${newCount === 1 ? "" : "s"} · ${rawPosts.length} total · top outlier analyzed automatically.`
        : `${newCount} new post${newCount === 1 ? "" : "s"} · ${rawPosts.length} total this pull.`,
      href: autoAnalyzed ? `/outlier/video/${autoAnalyzed}` : "/outlier/feed",
    });

    return { ok: true, newCount, totalPulled: rawPosts.length, autoAnalyzed };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pull failed.";
    await admin.from("outlier_handles").update({ status: "error", error: message }).eq("id", handle.id);
    if (jobId) {
      await admin.from("outlier_jobs").update({ state: "failed", error: message, finished_at: new Date().toISOString() }).eq("id", jobId);
    }
    await admin.from("notifications").insert({
      user_id: handle.user_id,
      title: `Pull failed — @${handle.handle}`,
      body: message,
      href: "/outlier/progress",
    });
    return { ok: false, error: message };
  }
}
