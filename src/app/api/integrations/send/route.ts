import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNow } from "@/lib/integrations/deliver";
import { parseProvider, requireUser, unauthorized } from "@/lib/integrations/http";
import { buildOutlierPayload, buildScorecardPayload } from "@/lib/integrations/messages";
import { getRow } from "@/lib/integrations/store";

// "Send to…" on a result or scorecard: pushes that one result to one
// connected destination right now (and logs it like any delivery).
export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const body = (await request.json().catch(() => null)) as { provider?: string; kind?: string; id?: string } | null;
  const provider = parseProvider(body?.provider ?? "");
  if (!provider || typeof body?.id !== "string" || (body.kind !== "signal" && body.kind !== "outlier")) {
    return NextResponse.json({ error: "Missing destination or result." }, { status: 400 });
  }

  const row = await getRow(user.id, provider);
  if (!row || row.status !== "connected") return NextResponse.json({ error: "That destination isn't connected." }, { status: 400 });

  const admin = createAdminClient();
  const payload = body.kind === "signal" ? await buildScorecardPayload(admin, user.id, body.id) : await buildOutlierPayload(admin, user.id, body.id);
  if (!payload) return NextResponse.json({ error: "That result isn't ready to send." }, { status: 404 });

  const result = await sendNow(row, payload);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
