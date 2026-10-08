import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmailAddress, ConnectionConfig } from "@/lib/integrations/types";

// Resend delivery webhooks (Svix-signed). A bounce or spam complaint
// disables that address on every account that has it, and the card shows
// why.
function verifySvix(request: Request, rawBody: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false;
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 5 * 60) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();
  return signature.split(" ").some((part) => {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) return false;
    const given = Buffer.from(value, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySvix(request, raw)) return NextResponse.json({ error: "Bad signature." }, { status: 401 });

  const event = JSON.parse(raw) as { type?: string; data?: { to?: string[] } };
  const reason = event.type === "email.bounced" ? "Bounced" : event.type === "email.complained" ? "Marked as spam" : null;
  if (!reason) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  for (const address of (event.data?.to ?? []).map((a) => a.toLowerCase())) {
    const { data: rows } = await admin.from("integrations").select("id, config").eq("provider", "email").contains("config", { addresses: [{ email: address }] });
    for (const row of rows ?? []) {
      const config = row.config as ConnectionConfig;
      const addresses: EmailAddress[] = (config.addresses ?? []).map((a) => (a.email === address ? { ...a, disabled: reason } : a));
      await admin
        .from("integrations")
        .update({ config: { ...config, addresses }, updated_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  }
  return NextResponse.json({ ok: true });
}
