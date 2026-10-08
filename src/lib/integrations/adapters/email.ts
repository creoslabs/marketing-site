import { siteUrl } from "../config";
import { integrationsLink } from "../links";
import type { Adapter, DeliveryPayload } from "../types";

const PRODUCT_NAME = { outlier: "OUTLIER", signal: "SIGNAL", creos: "CREOS LABS" } as const;

function esc(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Monochrome, matches the site: white ground, black ink, hairline rules,
// Helvetica. The wordmark is the approved lockup artwork (PNG render of the
// brand-pack SVG, since mail clients don't render SVG).
export function renderEmail(payload: DeliveryPayload, opts?: { manageHref?: string }): { subject: string; html: string; text: string } {
  const product = payload.product === "creos" ? null : PRODUCT_NAME[payload.product];
  const manageHref = opts?.manageHref ?? integrationsLink(payload.product === "creos" ? "workspace" : payload.product);
  const logo = `${siteUrl()}/brand/creos/creos-labs-lockup-1-symbol-left-mono-black@2x.png`;

  const body =
    payload.items && payload.items.length > 0
      ? payload.items
          .map(
            (item) =>
              `<tr><td style="padding:14px 0;border-top:1px solid #dad7cf;font-size:15px;line-height:1.45;"><a href="${esc(item.href)}" style="color:#0b0b0a;font-weight:600;text-decoration:none;">${esc(item.headline)}</a>${
                item.detail ? `<br><span style="color:#55534d;">${esc(item.detail)}</span>` : ""
              }</td></tr>`
          )
          .join("")
      : payload.lines.map((line) => `<tr><td style="padding:6px 0;font-size:15px;line-height:1.45;color:#2b2a27;">${esc(line)}</td></tr>`).join("");

  const thumb =
    payload.thumbnailUrl && !payload.items
      ? `<tr><td style="padding:0 0 18px;"><img src="${esc(payload.thumbnailUrl)}" alt="" width="160" style="display:block;border-radius:12px;max-width:160px;height:auto;"></td></tr>`
      : "";

  const html = `<!doctype html><html><body style="margin:0;background:#f4f2ec;font-family:Helvetica,Arial,sans-serif;color:#0b0b0a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;padding:32px;">
<tr><td style="padding-bottom:24px;"><img src="${esc(logo)}" alt="Creos Labs" height="22" style="display:block;height:22px;width:auto;">${
    product ? `<div style="margin-top:14px;font-size:11px;letter-spacing:0.12em;color:#55534d;">${product} · ${esc(payload.title.toUpperCase())}</div>` : ""
  }</td></tr>
<tr><td style="padding-bottom:14px;font-size:26px;line-height:1.15;font-weight:700;letter-spacing:-0.02em;">${esc(payload.headline)}</td></tr>
${thumb}${body}
<tr><td style="padding:22px 0 8px;"><a href="${esc(payload.href)}" style="display:inline-block;background:#0b0b0a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">${esc(payload.ctaLabel)}</a></td></tr>
<tr><td style="padding-top:28px;border-top:1px solid #dad7cf;font-size:12px;line-height:1.5;color:#77746d;">You get this because an email destination is switched on in your Creos Labs account. <a href="${esc(manageHref)}" style="color:#0b0b0a;">Change what's sent</a>.</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `${product ? `${product} · ` : ""}${payload.title}`,
    payload.headline,
    ...(payload.items ? payload.items.map((i) => `- ${i.headline}${i.detail ? ` — ${i.detail}` : ""}\n  ${i.href}`) : payload.lines),
    "",
    `${payload.ctaLabel}: ${payload.href}`,
    "",
    `Change what's sent: ${manageHref}`,
  ].join("\n");

  return { subject: `${product ? `${titleCase(product)} · ` : ""}${payload.headline}`, html, text };
}

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export async function sendResend(to: string, message: { subject: string; html: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Email isn't configured.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: message.subject, html: message.html, text: message.text }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Email provider said ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}.`);
  }
}

export const emailAdapter: Adapter = {
  async send({ integration }, payload) {
    const targets = (integration.config.addresses ?? []).filter((a) => a.confirmed && !a.disabled);
    if (targets.length === 0) throw new Error("No confirmed email address to send to.");
    const message = renderEmail(payload);
    // One message per address so a bad address can't block the others and
    // recipients never see each other.
    const results = await Promise.allSettled(targets.map((t) => sendResend(t.email, message)));
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failed.length === results.length) throw failed[0].reason;
  },
};
