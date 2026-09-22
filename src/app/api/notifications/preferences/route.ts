import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";
import { NOTIFICATION_CATEGORIES } from "@/lib/notification-prefs";

const VALID_KEYS = new Set(NOTIFICATION_CATEGORIES.map((c) => c.key));

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const category = typeof body?.category === "string" ? body.category : null;
  const enabled = typeof body?.enabled === "boolean" ? body.enabled : null;
  if (!category || !VALID_KEYS.has(category as never) || enabled === null) {
    return NextResponse.json({ error: "Missing or invalid category/enabled." }, { status: 400 });
  }

  const supabase = await createClient();
  // jsonb columns are replaced wholesale by upsert, not deep-merged — read
  // the existing object first so toggling one category doesn't clobber
  // the others.
  const { data: existing } = await supabase.from("notification_preferences").select("categories").eq("user_id", user.id).maybeSingle();
  const categories = { ...((existing?.categories as Record<string, boolean>) ?? {}), [category]: enabled };

  const { error } = await supabase.from("notification_preferences").upsert({ user_id: user.id, categories });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
