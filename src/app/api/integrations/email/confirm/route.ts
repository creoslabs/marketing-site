import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/integrations/crypto";
import { integrationsReturnUrl } from "@/lib/integrations/http";
import { getRow, updateRow } from "@/lib/integrations/store";

// The link in the confirmation email. The signed token carries the account
// and address, so this works from any browser; it only proves the person
// controls the inbox.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const data = verifyToken<{ u: string; e: string }>(token);
  if (!data) return NextResponse.redirect(integrationsReturnUrl(request, "workspace", { error: "That confirmation link expired. Add the address again to get a new one.", provider: "email" }));

  const row = await getRow(data.u, "email");
  const addresses = row?.config.addresses ?? [];
  if (!row || !addresses.some((a) => a.email === data.e)) {
    return NextResponse.redirect(integrationsReturnUrl(request, "workspace", { error: "That address was removed.", provider: "email" }));
  }
  const confirmed = addresses.map((a) => (a.email === data.e ? { email: a.email, confirmed: true } : a));
  const count = confirmed.filter((a) => a.confirmed && !a.disabled).length;
  await updateRow(row.id, { config: { ...row.config, addresses: confirmed }, label: `${count} address${count === 1 ? "" : "es"}`, status: "connected" });
  return NextResponse.redirect(integrationsReturnUrl(request, "workspace", { connected: "email" }));
}
