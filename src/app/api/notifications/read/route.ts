import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const supabase = await createClient();

  if (body?.all === true) {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  } else if (typeof body?.id === "string") {
    // RLS scopes this to the caller's own rows regardless.
    await supabase.from("notifications").update({ read: true }).eq("id", body.id);
  } else {
    return NextResponse.json({ error: "Missing id or all." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
