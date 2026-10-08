import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/integrations/http";
import { listIntegrations } from "@/lib/integrations/store";

// For the "Send to…" menu: which destinations can take a result right now.
// Names and labels only — never anything secret.
export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const all = await listIntegrations(user.id);
    const destinations = all
      .filter((i) => i.state === "connected" || i.state === "error")
      .filter((i) => i.provider !== "email" || (i.config.addresses ?? []).some((a) => a.confirmed && !a.disabled))
      .filter((i) => !i.needsSetup)
      .map((i) => ({ provider: i.provider, label: i.label }));
    return NextResponse.json({ destinations });
  } catch {
    return NextResponse.json({ destinations: [] });
  }
}
