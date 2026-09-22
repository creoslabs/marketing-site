import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/outlier/creators/[id]">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = await createClient();

  // RLS scopes the delete to the caller's own creators (and cascades to
  // their posts/jobs) — a foreign or missing id both just delete nothing.
  const { error } = await supabase.from("outlier_creators").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/outlier/creators/[id]">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (typeof body?.notes !== "string") {
    return NextResponse.json({ error: "Missing notes." }, { status: 400 });
  }

  const supabase = await createClient();
  // RLS scopes this to the caller's own creators — no explicit check needed.
  const { error } = await supabase.from("outlier_creators").update({ notes: body.notes }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
