import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApifyToken, pullTikTok, pullInstagram, pullYouTube } from "@/lib/outlier/apify";
import { analyzeOutlierPost } from "@/lib/outlier/analyze-post";

function medianOf(nums: number[]) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

// A metadata-only pull is fast, but the best new outlier now also gets
// auto-analyzed (download + transcribe + Claude) in the same request —
// that's the slow part, same ceiling as Signal's video pipeline.
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const handleId = typeof body?.handleId === "string" ? body.handleId : null;
  if (!handleId) {
    return NextResponse.json({ error: "Missing handleId." }, { status: 400 });
  }
  const postLimit = Math.min(100, Math.max(5, Number(body?.postLimit) || 30));

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }

  const { data: handle } = await admin
    .from("outlier_handles")
    .select("id, user_id, platform, handle")
    .eq("id", handleId)
    .single();

  if (!handle || handle.user_id !== user.id) {
    return NextResponse.json({ error: "Handle not found." }, { status: 404 });
  }

  const { data: jobRow } = await admin
    .from("outlier_jobs")
    .insert({ user_id: user.id, handle_id: handleId, state: "running", stage: "Pulling posts…" })
    .select("id")
    .single();
  const jobId = jobRow?.id as string | undefined;

  await admin.from("outlier_handles").update({ status: "pulling", error: null }).eq("id", handleId);

  try {
    const userApifyKey =
      typeof user.user_metadata?.outlier_apify_api_key === "string" ? user.user_metadata.outlier_apify_api_key : null;
    const token = getApifyToken(userApifyKey);

    const { posts: rawPosts, avatarUrl } =
      handle.platform === "TT"
        ? await pullTikTok(handle.handle, token, postLimit)
        : handle.platform === "IG"
          ? await pullInstagram(handle.handle, token, postLimit)
          : await pullYouTube(handle.handle, token, postLimit);

    const { data: existing } = await admin.from("outlier_posts").select("external_id").eq("handle_id", handleId);
    const existingIds = new Set((existing ?? []).map((r) => r.external_id));
    const newCount = rawPosts.filter((p) => !existingIds.has(p.externalId)).length;

    if (avatarUrl) {
      await admin.from("outlier_handles").update({ avatar_url: avatarUrl }).eq("id", handleId);
    }

    if (rawPosts.length > 0) {
      const { error: upsertError } = await admin.from("outlier_posts").upsert(
        rawPosts.map((p) => ({
          handle_id: handleId,
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
      .eq("id", handleId);

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
      .eq("handle_id", handleId);
    const median = medianOf((allPostRows ?? []).map((r) => r.views));
    const bestNew = (allPostRows ?? [])
      .filter((r) => !existingIds.has(r.external_id) && handle.platform !== "YT" && median > 0 && r.views / median >= 2)
      .sort((a, b) => b.views - a.views)[0];

    if (bestNew) {
      const result = await analyzeOutlierPost({
        admin,
        post: { ...bestNew, platform: handle.platform },
        userApifyKey,
        userGroqKey: typeof user.user_metadata?.outlier_groq_api_key === "string" ? user.user_metadata.outlier_groq_api_key : null,
        userAnthropicKey:
          typeof user.user_metadata?.signal_anthropic_api_key === "string" ? user.user_metadata.signal_anthropic_api_key : null,
      });
      if (result.ok) autoAnalyzed = bestNew.id;
    }

    await admin.from("notifications").insert({
      user_id: user.id,
      title: `Pulled @${handle.handle}`,
      body: autoAnalyzed
        ? `${newCount} new post${newCount === 1 ? "" : "s"} · ${rawPosts.length} total · top outlier analyzed automatically.`
        : `${newCount} new post${newCount === 1 ? "" : "s"} · ${rawPosts.length} total this pull.`,
      href: autoAnalyzed ? `/outlier/video/${autoAnalyzed}` : "/outlier/feed",
    });

    return NextResponse.json({ newCount, totalPulled: rawPosts.length, autoAnalyzed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pull failed.";
    await admin.from("outlier_handles").update({ status: "error", error: message }).eq("id", handleId);
    if (jobId) {
      await admin.from("outlier_jobs").update({ state: "failed", error: message, finished_at: new Date().toISOString() }).eq("id", jobId);
    }
    await admin.from("notifications").insert({
      user_id: user.id,
      title: `Pull failed — @${handle.handle}`,
      body: message,
      href: "/outlier/progress",
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
