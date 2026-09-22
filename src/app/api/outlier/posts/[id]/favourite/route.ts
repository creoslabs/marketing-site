import { NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, ctx: RouteContext<"/api/outlier/posts/[id]/favourite">) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const favourited = Boolean(body?.favourited);

  const { data: post } = await admin
    .from("outlier_posts")
    .select("id, handle_id, outlier_handles!inner(user_id)")
    .eq("id", id)
    .single();

  if (!post || (post.outlier_handles as unknown as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { error } = await admin.from("outlier_posts").update({ favourited }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: `Could not update favourite: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, favourited });
}
