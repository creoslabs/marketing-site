import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const platform = body?.platform === "TT" || body?.platform === "IG" || body?.platform === "YT" ? body.platform : null;
  const handle = typeof body?.handle === "string" ? body.handle.trim().replace(/^@/, "") : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";

  if (!platform || !handle) {
    return NextResponse.json({ error: "Choose a platform and enter a handle." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: creator, error: creatorError } = await supabase
    .from("outlier_creators")
    .insert({ user_id: user.id, display_name: displayName || handle })
    .select("id")
    .single();
  if (creatorError || !creator) {
    return NextResponse.json({ error: creatorError?.message ?? "Could not create creator." }, { status: 500 });
  }

  const { data: handleRow, error: handleError } = await supabase
    .from("outlier_handles")
    .insert({ creator_id: creator.id, user_id: user.id, platform, handle })
    .select("id")
    .single();
  if (handleError || !handleRow) {
    await supabase.from("outlier_creators").delete().eq("id", creator.id);
    const message = handleError?.code === "23505" ? "You're already tracking that handle." : handleError?.message;
    return NextResponse.json({ error: message ?? "Could not add handle." }, { status: 400 });
  }

  return NextResponse.json({ creatorId: creator.id, handleId: handleRow.id });
}
