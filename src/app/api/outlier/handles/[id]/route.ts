import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

// Removes one platform from a creator. If that was the creator's only
// handle, the now-empty creator card is removed too rather than left
// lingering with nothing to show.
export async function DELETE(_request: Request, ctx: RouteContext<"/api/outlier/handles/[id]">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: handle } = await supabase.from("outlier_handles").select("id, creator_id").eq("id", id).maybeSingle();
  if (!handle) {
    return NextResponse.json({ error: "Handle not found." }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from("outlier_handles").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { count } = await supabase
    .from("outlier_handles")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", handle.creator_id);

  if (!count) {
    await supabase.from("outlier_creators").delete().eq("id", handle.creator_id);
  }

  return NextResponse.json({ ok: true, creatorRemoved: !count });
}
