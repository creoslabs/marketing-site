import type { SupabaseClient } from "@supabase/supabase-js";
import { analyzePost } from "./deep-analysis";
import { getApifyToken, fetchTikTokVideoUrl } from "./apify";

type PostForAnalysis = {
  id: string;
  caption: string | null;
  url: string;
  platform: string;
  video_url: string | null;
  duration_seconds: number | null;
};

export async function analyzeOutlierPost({
  admin,
  post,
  userApifyKey,
  userGroqKey,
  userAnthropicKey,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this project doesn't generate a Database type for the Supabase client.
  admin: SupabaseClient<any>;
  post: PostForAnalysis;
  userApifyKey?: string | null;
  userGroqKey?: string | null;
  userAnthropicKey?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await admin.from("outlier_posts").update({ analysis_status: "analyzing", analysis_error: null }).eq("id", post.id);

  try {
    let videoUrl = post.video_url;

    // TikTok's pull doesn't fetch a downloadable video for every post (that
    // costs extra per post via Apify's download add-on) — resolve one now,
    // for just this post, since it's actually going to be analyzed.
    if (!videoUrl && post.platform === "TT") {
      const apifyToken = getApifyToken(userApifyKey);
      videoUrl = await fetchTikTokVideoUrl(post.url, apifyToken);
      if (videoUrl) {
        await admin.from("outlier_posts").update({ video_url: videoUrl }).eq("id", post.id);
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
      .eq("id", post.id);

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    await admin.from("outlier_posts").update({ analysis_status: "failed", analysis_error: message }).eq("id", post.id);
    return { ok: false, error: message };
  }
}
