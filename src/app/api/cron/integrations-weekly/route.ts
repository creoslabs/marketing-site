import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emit } from "@/lib/integrations/deliver";
import { buildWeeklyDigest } from "@/lib/integrations/messages";

// Mondays 14:00 UTC (vercel.json): builds each connected user's weekly
// outlier digest and queues it to every destination that has it switched on.
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }

  const { data: rows } = await admin.from("integrations").select("user_id").eq("status", "connected");
  const userIds = [...new Set((rows ?? []).map((r) => r.user_id as string))];

  let queued = 0;
  for (const userId of userIds) {
    const digest = await buildWeeklyDigest(admin, userId);
    if (digest) queued += await emit(userId, "weekly_digest", digest);
  }
  return NextResponse.json({ users: userIds.length, queued });
}
