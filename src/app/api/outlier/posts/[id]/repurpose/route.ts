import { NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateRepurpose } from "@/lib/outlier/repurpose";
import { shouldNotify } from "@/lib/notification-prefs";

// A single text-generation call over an already-analyzed post — no video
// download or transcription involved, unlike the analyze route.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request, ctx: RouteContext<"/api/outlier/posts/[id]/repurpose">) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return NextResponse.json({ error: "Tell us what your content is about first." }, { status: 400 });
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
    .select(
      "id, caption, views, analysis_status, transcript, beats, hook_tags, handle_id, outlier_handles!inner(user_id, creator_id)"
    )
    .eq("id", id)
    .single();

  const handleInfo = post?.outlier_handles as unknown as { user_id: string; creator_id: string } | undefined;
  if (!post || !handleInfo || handleInfo.user_id !== user.id) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  if (post.analysis_status !== "done") {
    return NextResponse.json({ error: "Analyze this post before repurposing it." }, { status: 400 });
  }

  // The score at repurpose time — recomputing the creator's live median just
  // for this label isn't worth another query; views/median from the pull
  // is already shown everywhere else this post appears.
  const { data: handleRows } = await admin.from("outlier_posts").select("views").eq("handle_id", post.handle_id);
  const views = (handleRows ?? []).map((r) => r.views as number).sort((a, b) => a - b);
  const median = views.length > 0 ? views[Math.floor(views.length / 2)] : 0;
  const sourceScore = median > 0 ? post.views / median : 0;

  try {
    const anthropicKey =
      typeof user.user_metadata?.signal_anthropic_api_key === "string" ? user.user_metadata.signal_anthropic_api_key : null;

    const script = await generateRepurpose({
      transcript: post.transcript ?? [],
      beats: post.beats ?? [],
      hookTags: post.hook_tags ?? [],
      caption: post.caption ?? "",
      topic,
      anthropicKey,
    });

    const { data: inserted, error } = await admin
      .from("outlier_repurposes")
      .insert({
        user_id: user.id,
        post_id: post.id,
        creator_id: handleInfo.creator_id,
        topic,
        source_score: sourceScore,
        title: script.title,
        hook: script.hook,
        beats: script.beats,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (await shouldNotify(admin, user.id, "repurpose")) {
      await admin.from("notifications").insert({
        user_id: user.id,
        title: "Repurposed script ready",
        body: script.title,
        href: `/outlier/repurpose/${inserted.id}`,
      });
    }

    return NextResponse.json({ id: inserted.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't generate a script.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
