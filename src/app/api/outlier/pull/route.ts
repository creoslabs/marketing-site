import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApifyToken, pullTikTok, pullInstagram } from "@/lib/outlier/apify";

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
  const creatorId = typeof body?.creatorId === "string" ? body.creatorId : null;
  if (!creatorId) {
    return NextResponse.json({ error: "Missing creatorId." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }

  const { data: creator } = await admin
    .from("outlier_creators")
    .select("id, user_id, platform, handle")
    .eq("id", creatorId)
    .single();

  if (!creator || creator.user_id !== user.id) {
    return NextResponse.json({ error: "Creator not found." }, { status: 404 });
  }

  const { data: jobRow } = await admin
    .from("outlier_jobs")
    .insert({ user_id: user.id, creator_id: creatorId, state: "running", stage: "Pulling posts…" })
    .select("id")
    .single();
  const jobId = jobRow?.id as string | undefined;

  await admin.from("outlier_creators").update({ status: "pulling", error: null }).eq("id", creatorId);

  try {
    const userApifyKey =
      typeof user.user_metadata?.outlier_apify_api_key === "string" ? user.user_metadata.outlier_apify_api_key : null;
    const token = getApifyToken(userApifyKey);

    const rawPosts =
      creator.platform === "TT" ? await pullTikTok(creator.handle, token) : await pullInstagram(creator.handle, token);

    const { data: existing } = await admin.from("outlier_posts").select("external_id").eq("creator_id", creatorId);
    const existingIds = new Set((existing ?? []).map((r) => r.external_id));
    const newCount = rawPosts.filter((p) => !existingIds.has(p.externalId)).length;

    if (rawPosts.length > 0) {
      const { error: upsertError } = await admin.from("outlier_posts").upsert(
        rawPosts.map((p) => ({
          creator_id: creatorId,
          external_id: p.externalId,
          platform: creator.platform,
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
        { onConflict: "creator_id,external_id" }
      );
      if (upsertError) throw new Error(upsertError.message);
    }

    await admin
      .from("outlier_creators")
      .update({ status: "active", last_pulled_at: new Date().toISOString(), error: null })
      .eq("id", creatorId);

    if (jobId) {
      await admin
        .from("outlier_jobs")
        .update({ state: "done", new_posts_count: newCount, finished_at: new Date().toISOString() })
        .eq("id", jobId);
    }

    await admin.from("notifications").insert({
      user_id: user.id,
      title: `Pulled @${creator.handle}`,
      body: `${newCount} new post${newCount === 1 ? "" : "s"} · ${rawPosts.length} total this pull.`,
      href: "/outlier/feed",
    });

    return NextResponse.json({ newCount, totalPulled: rawPosts.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pull failed.";
    await admin.from("outlier_creators").update({ status: "error", error: message }).eq("id", creatorId);
    if (jobId) {
      await admin.from("outlier_jobs").update({ state: "failed", error: message, finished_at: new Date().toISOString() }).eq("id", jobId);
    }
    await admin.from("notifications").insert({
      user_id: user.id,
      title: `Pull failed — @${creator.handle}`,
      body: message,
      href: "/outlier/progress",
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
