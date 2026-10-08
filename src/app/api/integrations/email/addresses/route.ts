import { NextResponse } from "next/server";
import { providerConfigured, siteUrl } from "@/lib/integrations/config";
import { signToken } from "@/lib/integrations/crypto";
import { requireUser, unauthorized } from "@/lib/integrations/http";
import { disconnect, getRow, saveConnection, updateRow } from "@/lib/integrations/store";
import { sendResend } from "@/lib/integrations/adapters/email";
import type { EmailAddress } from "@/lib/integrations/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ADDRESSES = 5;

function confirmationEmail(link: string) {
  return {
    subject: "Confirm this address for Creos Labs alerts",
    text: `Someone added this address to receive Creos Labs alerts and digests.\n\nConfirm it: ${link}\n\nIf this wasn't you, ignore this email — nothing will be sent until it's confirmed.`,
    html: `<!doctype html><html><body style="margin:0;background:#f4f2ec;font-family:Helvetica,Arial,sans-serif;color:#0b0b0a;"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px;"><table role="presentation" width="520" style="max-width:520px;background:#fff;border-radius:20px;padding:32px;"><tr><td style="font-size:24px;font-weight:700;letter-spacing:-0.02em;padding-bottom:12px;">Confirm this address</td></tr><tr><td style="font-size:15px;line-height:1.5;color:#2b2a27;padding-bottom:22px;">Someone added this address to receive Creos Labs alerts and digests. Nothing will be sent until you confirm it.</td></tr><tr><td><a href="${link}" style="display:inline-block;background:#0b0b0a;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">Confirm address</a></td></tr><tr><td style="padding-top:24px;font-size:12px;color:#77746d;">If this wasn't you, ignore this email.</td></tr></table></td></tr></table></body></html>`,
  };
}

// POST { email } adds an address (each new one gets a confirmation email
// before anything sends to it); POST { email, resend: true } re-sends the
// confirmation. DELETE { email } removes one.
export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();
  if (!providerConfigured("email")) return NextResponse.json({ error: "Email isn't available yet." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const existing = await getRow(user.id, "email");
  const addresses: EmailAddress[] = existing?.config.addresses ?? [];
  const found = addresses.find((a) => a.email === email);
  if (found?.confirmed && !found.disabled) return NextResponse.json({ ok: true, alreadyConfirmed: true });
  if (!found && addresses.length >= MAX_ADDRESSES) return NextResponse.json({ error: `You can add up to ${MAX_ADDRESSES} addresses.` }, { status: 400 });

  const next: EmailAddress[] = found ? addresses.map((a) => (a.email === email ? { email, confirmed: false } : a)) : [...addresses, { email, confirmed: false }];
  if (existing) await updateRow(existing.id, { config: { ...existing.config, addresses: next } });
  else await saveConnection({ userId: user.id, provider: "email", label: null, config: { addresses: next } });

  const token = signToken({ u: user.id, e: email }, 7 * 24 * 60 * 60);
  const link = `${siteUrl()}/api/integrations/email/confirm?token=${encodeURIComponent(token)}`;
  try {
    await sendResend(email, confirmationEmail(link));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Couldn't send the confirmation email." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const existing = await getRow(user.id, "email");
  if (!existing) return NextResponse.json({ ok: true });

  const next = (existing.config.addresses ?? []).filter((a) => a.email !== email);
  if (next.length === 0) {
    await disconnect(user.id, "email");
  } else {
    await updateRow(existing.id, { config: { ...existing.config, addresses: next } });
  }
  return NextResponse.json({ ok: true });
}
