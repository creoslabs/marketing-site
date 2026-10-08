import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Slack Events API endpoint. Listens for app_uninstalled and tokens_revoked
// and flips every affected connection to "Reconnect required".
function verifySlack(request: Request, raw: string): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  const timestamp = request.headers.get("x-slack-request-timestamp");
  const signature = request.headers.get("x-slack-signature");
  if (!secret || !timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 5 * 60) return false;
  const expected = Buffer.from(`v0=${createHmac("sha256", secret).update(`v0:${timestamp}:${raw}`).digest("hex")}`);
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySlack(request, raw)) return NextResponse.json({ error: "Bad signature." }, { status: 401 });

  const body = JSON.parse(raw) as { type?: string; challenge?: string; team_id?: string; event?: { type?: string; tokens?: { bot?: string[] } } };
  if (body.type === "url_verification") return NextResponse.json({ challenge: body.challenge });

  const type = body.event?.type;
  const botRevoked = type === "tokens_revoked" && (body.event?.tokens?.bot?.length ?? 0) > 0;
  if ((type === "app_uninstalled" || botRevoked) && body.team_id) {
    const admin = createAdminClient();
    await admin
      .from("integrations")
      .update({ status: "attention", updated_at: new Date().toISOString() })
      .eq("provider", "slack")
      .contains("config", { teamId: body.team_id });
  }
  return NextResponse.json({ ok: true });
}
