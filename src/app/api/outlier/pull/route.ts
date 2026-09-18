import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApifyToken, pullTikTok, pullInstagram, pullYouTube } from "@/lib/outlier/apify";

// A metadata-only Apify scrape of ~30 posts should finish well within this,
// but actor run times vary — matches the ceiling used for Signal's pipeline.
export const runtime = "nodejs";
export const maxDuration = 120;

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

    const rawPosts =
      handle.platform === "TT"
        ? await pullTikTok(handle.handle, token)
        : handle.platform === "IG"
          ? await pullInstagram(handle.handle, token)
          : await pullYouTube(handle.handle, token);

    const { data: existing } = await admin.from("outlier_posts").select("external_id").eq("handle_id", handleId);
    const existingIds = new Set((existing ?? []).map((r) => r.external_id));
    const newCount = rawPosts.filter((p) => !existingIds.has(p.externalId)).length;

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

    await admin.from("notifications").insert({
      user_id: user.id,
      title: `Pulled @${handle.handle}`,
      body: `${newCount} new post${newCount === 1 ? "" : "s"} · ${rawPosts.length} total this pull.`,
      href: "/outlier/feed",
    });

    return NextResponse.json({ newCount, totalPulled: rawPosts.length });
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
