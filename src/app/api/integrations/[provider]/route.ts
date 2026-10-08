import { NextResponse } from "next/server";
import { EVENT_BY_KEY, LOCKED_ON, supportedEvents, type EventKey, type Frequency } from "@/lib/integrations/events";
import { parseProvider, requireUser, unauthorized } from "@/lib/integrations/http";
import { disconnect, getRow, setRouting } from "@/lib/integrations/store";

// PATCH: change routing for one event (on/off, frequency).
export async function PATCH(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const provider = parseProvider((await params).provider);
  if (!provider) return NextResponse.json({ error: "Unknown integration." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as { event?: string; enabled?: unknown; frequency?: unknown } | null;
  const event = body?.event as EventKey | undefined;
  if (!event || !supportedEvents(provider).includes(event)) return NextResponse.json({ error: "Unknown event." }, { status: 400 });

  const patch: { enabled?: boolean; frequency?: Frequency } = {};
  if (typeof body?.enabled === "boolean") {
    if (!body.enabled && LOCKED_ON[provider]?.includes(event)) return NextResponse.json({ error: "This one can't be turned off." }, { status: 400 });
    patch.enabled = body.enabled;
  }
  if (typeof body?.frequency === "string") {
    if (!EVENT_BY_KEY[event].frequencies.includes(body.frequency as Frequency)) return NextResponse.json({ error: "Unsupported frequency." }, { status: 400 });
    patch.frequency = body.frequency as Frequency;
  }

  const row = await getRow(user.id, provider);
  if (!row) return NextResponse.json({ error: "Not connected." }, { status: 404 });
  await setRouting(row, provider, event, patch);
  return NextResponse.json({ ok: true });
}

// DELETE: disconnect. Revokes the token with the provider where an API
// exists, deletes it from storage and drops everything still queued.
export async function DELETE(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const provider = parseProvider((await params).provider);
  if (!provider) return NextResponse.json({ error: "Unknown integration." }, { status: 404 });
  await disconnect(user.id, provider);
  return NextResponse.json({ ok: true });
}
