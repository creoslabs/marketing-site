import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/outlier/collections/[id]">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = await createClient();

  // RLS scopes this to the caller's own collections — a foreign or missing
  // id both just delete nothing.
  const { error } = await supabase.from("outlier_collections").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
