import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

// Adds another platform to an existing creator — e.g. tracking the same
// person's Instagram alongside a TikTok that's already tracked.
export async function POST(request: Request, ctx: RouteContext<"/api/outlier/creators/[id]/handles">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id: creatorId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const platform = body?.platform === "TT" || body?.platform === "IG" || body?.platform === "YT" ? body.platform : null;
  const handle = typeof body?.handle === "string" ? body.handle.trim().replace(/^@/, "") : "";

  if (!platform || !handle) {
    return NextResponse.json({ error: "Choose a platform and enter a handle." }, { status: 400 });
  }

  const supabase = await createClient();

  // RLS also enforces this, but a clear 404 beats a generic insert failure.
  const { data: creator } = await supabase.from("outlier_creators").select("id").eq("id", creatorId).maybeSingle();
  if (!creator) {
    return NextResponse.json({ error: "Creator not found." }, { status: 404 });
  }

  const { error } = await supabase.from("outlier_handles").insert({ creator_id: creatorId, user_id: user.id, platform, handle });
  if (error) {
    const message = error.code === "23505" ? "You're already tracking that handle." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
