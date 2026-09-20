import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { pullHandle } from "@/lib/outlier/pull-handle";

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

  const result = await pullHandle(
    admin,
    handle,
    {
      apifyKey: typeof user.user_metadata?.outlier_apify_api_key === "string" ? user.user_metadata.outlier_apify_api_key : null,
      groqKey: typeof user.user_metadata?.outlier_groq_api_key === "string" ? user.user_metadata.outlier_groq_api_key : null,
      anthropicKey: typeof user.user_metadata?.signal_anthropic_api_key === "string" ? user.user_metadata.signal_anthropic_api_key : null,
    },
    postLimit
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ newCount: result.newCount, totalPulled: result.totalPulled, autoAnalyzed: result.autoAnalyzed });
}
