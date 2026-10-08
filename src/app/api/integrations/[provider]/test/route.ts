import { NextResponse } from "next/server";
import { sendTest } from "@/lib/integrations/deliver";
import { parseProvider, requireUser, unauthorized } from "@/lib/integrations/http";
import { getRow } from "@/lib/integrations/store";

export async function POST(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const provider = parseProvider((await params).provider);
  if (!provider) return NextResponse.json({ error: "Unknown integration." }, { status: 404 });

  const row = await getRow(user.id, provider);
  if (!row) return NextResponse.json({ error: "Not connected." }, { status: 404 });
  const result = await sendTest(row);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
