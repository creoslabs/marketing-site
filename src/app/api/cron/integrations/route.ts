import { NextResponse } from "next/server";
import { processDue } from "@/lib/integrations/deliver";

// Runs every minute (vercel.json): sends queued deliveries, retries failures
// with backoff, and releases daily/weekly digests when their window opens.
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
