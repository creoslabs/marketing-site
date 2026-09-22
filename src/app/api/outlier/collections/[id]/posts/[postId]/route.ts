import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/outlier/collections/[id]/posts/[postId]">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id: collectionId, postId } = await ctx.params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("outlier_collection_posts")
    .delete()
    .eq("collection_id", collectionId)
    .eq("post_id", postId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
