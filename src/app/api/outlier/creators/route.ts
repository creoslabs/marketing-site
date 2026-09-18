import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const platform = body?.platform === "TT" || body?.platform === "IG" ? body.platform : null;
  const handle = typeof body?.handle === "string" ? body.handle.trim().replace(/^@/, "") : "";

  if (!platform || !handle) {
    return NextResponse.json({ error: "Choose a platform and enter a handle." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outlier_creators")
    .insert({ user_id: user.id, platform, handle })
    .select("id")
    .single();

  if (error) {
    const message = error.code === "23505" ? "You're already tracking that handle." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ creatorId: data.id });
}
