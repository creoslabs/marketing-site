import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeOutlierPost } from "@/lib/outlier/analyze-post";

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

  const result = await analyzeOutlierPost({
    admin,
    post,
    userApifyKey: typeof user.user_metadata?.outlier_apify_api_key === "string" ? user.user_metadata.outlier_apify_api_key : null,
    userGroqKey: typeof user.user_metadata?.outlier_groq_api_key === "string" ? user.user_metadata.outlier_groq_api_key : null,
    userAnthropicKey:
      typeof user.user_metadata?.signal_anthropic_api_key === "string" ? user.user_metadata.signal_anthropic_api_key : null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  await admin.from("notifications").insert({
    user_id: user.id,
    title: "Post analyzed",
    body: "Transcript and structure are ready.",
    href: `/outlier/video/${id}`,
  });

  return NextResponse.json({ ok: true });
}
