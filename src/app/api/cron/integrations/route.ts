import { NextResponse } from "next/server";
import { processDue } from "@/lib/integrations/deliver";

// Runs once a day at 14:30 UTC (vercel.json — Hobby plans allow daily crons
// only): sends anything still queued, retries failed deliveries, and releases
// the daily/weekly digests that open at 14:00 UTC. Instant deliveries don't
// wait for it — they're sent right after the request that queued them.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return NextResponse.json(await processDue(40));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }
}
