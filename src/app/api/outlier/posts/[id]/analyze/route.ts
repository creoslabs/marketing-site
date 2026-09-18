import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzePost } from "@/lib/outlier/deep-analysis";

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
    .select("id, caption, video_url, duration_seconds, creator_id, outlier_creators!inner(user_id)")
    .eq("id", id)
    .single();

  if (!post || (post.outlier_creators as unknown as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  if (!post.video_url) {
    return NextResponse.json({ error: "This post has no downloadable video." }, { status: 400 });
  }

  await admin.from("outlier_posts").update({ analysis_status: "analyzing", analysis_error: null }).eq("id", id);

  try {
    const userGroqKey = typeof user.user_metadata?.outlier_groq_api_key === "string" ? user.user_metadata.outlier_groq_api_key : null;
    const userAnthropicKey =
      typeof user.user_metadata?.signal_anthropic_api_key === "string" ? user.user_metadata.signal_anthropic_api_key : null;

    const result = await analyzePost({
      videoUrl: post.video_url,
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
