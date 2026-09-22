import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pullHandle, type HandleToPull } from "@/lib/outlier/pull-handle";

// Runs on Vercel Cron once a day (see vercel.json) and pulls every handle
// that hasn't been pulled in the last ~20 hours — the buffer keeps a
// same-day manual pull from being immediately re-run if the cron fires a
// little early. This is the automatic side of "every 24 hours"; the
// manual "Pull now" button (src/app/api/outlier/pull/route.ts) is the
// on-demand side and shares the same pullHandle() pipeline.
export const runtime = "nodejs";
export const maxDuration = 300;

const DUE_AFTER_MS = 20 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }

  const cutoff = new Date(Date.now() - DUE_AFTER_MS).toISOString();
  const { data: dueHandles, error } = await admin
    .from("outlier_handles")
    .select("id, user_id, creator_id, platform, handle")
    .or(`last_pulled_at.is.null,last_pulled_at.lt.${cutoff}`)
    .returns<HandleToPull[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!dueHandles || dueHandles.length === 0) {
    return NextResponse.json({ pulled: 0, results: [] });
  }

  // One handle at a time, same as the multi-handle "Pull all" flow — this
  // is a scheduled background job, not a page a user is staring at, so
  // there's no reason to parallelize against Apify's rate limits.
  const userKeyCache = new Map<string, { apifyKey: string | null; groqKey: string | null; anthropicKey: string | null }>();
  const results: { handleId: string; handle: string; ok: boolean; newCount?: number; error?: string }[] = [];

  for (const handle of dueHandles) {
    let apiKeys = userKeyCache.get(handle.user_id);
    if (!apiKeys) {
      const { data: userData } = await admin.auth.admin.getUserById(handle.user_id);
      const metadata = userData?.user?.user_metadata;
      apiKeys = {
        apifyKey: typeof metadata?.outlier_apify_api_key === "string" ? metadata.outlier_apify_api_key : null,
        groqKey: typeof metadata?.outlier_groq_api_key === "string" ? metadata.outlier_groq_api_key : null,
        anthropicKey: typeof metadata?.signal_anthropic_api_key === "string" ? metadata.signal_anthropic_api_key : null,
      };
      userKeyCache.set(handle.user_id, apiKeys);
    }

    const result = await pullHandle(admin, handle, apiKeys);
    results.push(
      result.ok
        ? { handleId: handle.id, handle: handle.handle, ok: true, newCount: result.newCount }
        : { handleId: handle.id, handle: handle.handle, ok: false, error: result.error }
    );
  }

  return NextResponse.json({ pulled: results.length, results });
}
