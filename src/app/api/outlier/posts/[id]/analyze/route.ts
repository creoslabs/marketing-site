import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzePost } from "@/lib/outlier/deep-analysis";
import { getApifyToken, fetchTikTokVideoUrl } from "@/lib/outlier/apify";

// Download + ffmpeg + Groq transcription + a Claude text call for one short
// video — the same order of magnitude as Signal's per-asset video pipeline.
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(_request: Request, ctx: RouteContext<"/api/outlier/posts/[id]/analyze">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }

  const { id } = await ctx.params;

  const { data: post } = await admin
    .from("outlier_posts")
    .select("id, caption, url, platform, video_url, duration_seconds, handle_id, outlier_handles!inner(user_id)")
    .eq("id", id)
    .single();

  if (!post || (post.outlier_handles as unknown as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  await admin.from("outlier_posts").update({ analysis_status: "analyzing", analysis_error: null }).eq("id", id);

  try {
    const userApifyKey =
      typeof user.user_metadata?.outlier_apify_api_key === "string" ? user.user_metadata.outlier_apify_api_key : null;
    const userGroqKey = typeof user.user_metadata?.outlier_groq_api_key === "string" ? user.user_metadata.outlier_groq_api_key : null;
    const userAnthropicKey =
      typeof user.user_metadata?.signal_anthropic_api_key === "string" ? user.user_metadata.signal_anthropic_api_key : null;

    let videoUrl = post.video_url;

    // TikTok's pull doesn't fetch a downloadable video for every post (that
    // costs extra per post via Apify's download add-on) — resolve one now,
    // for just this post, since the user is explicitly asking to analyze it.
    if (!videoUrl && post.platform === "TT") {
      const apifyToken = getApifyToken(userApifyKey);
      videoUrl = await fetchTikTokVideoUrl(post.url, apifyToken);
      if (videoUrl) {
        await admin.from("outlier_posts").update({ video_url: videoUrl }).eq("id", id);
      }
    }

    if (!videoUrl) {
      throw new Error("Couldn't get a downloadable video for this post.");
    }

    const result = await analyzePost({
      videoUrl,
      caption: post.caption ?? "",
      durationSeconds: post.duration_seconds ?? 0,
      groqKey: userGroqKey,
      anthropicKey: userAnthropicKey,
    });

    await admin
      .from("outlier_posts")
      .update({
        analysis_status: "done",
        transcript: result.transcript,
        beats: result.beats,
        hook_tags: result.hookTags,
        analyzed_at: new Date().toISOString(),
      })
      .eq("id", id);

    await admin.from("notifications").insert({
      user_id: user.id,
      title: "Post analyzed",
      body: `Transcript and structure are ready.`,
      href: `/outlier/video/${id}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    await admin.from("outlier_posts").update({ analysis_status: "failed", analysis_error: message }).eq("id", id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
