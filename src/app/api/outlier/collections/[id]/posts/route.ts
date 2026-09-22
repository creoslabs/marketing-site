import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, ctx: RouteContext<"/api/outlier/collections/[id]/posts">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id: collectionId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const postId = typeof body?.postId === "string" ? body.postId : null;
  if (!postId) {
    return NextResponse.json({ error: "Missing postId." }, { status: 400 });
  }

  const supabase = await createClient();
  // RLS's insert policy already verifies both the collection and the post
  // belong to the caller — a foreign id on either side just fails the
  // insert rather than needing a separate lookup here.
  const { error } = await supabase.from("outlier_collection_posts").insert({ collection_id: collectionId, post_id: postId });
  if (error) {
    const message = error.code === "23505" ? null : error.message;
    if (!message) return NextResponse.json({ ok: true }); // already in this collection
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
