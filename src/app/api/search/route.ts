import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

// Backs the command palette's search — every query here goes through the
// RLS-scoped client (not the admin client), so results are already
// naturally limited to the caller's own creators/posts/assets regardless
// of what "q" contains.
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ creators: [], posts: [], assets: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ creators: [], posts: [], assets: [] });
  }

  const supabase = await createClient();
  const like = `%${q}%`;
  const [{ data: creators }, { data: posts }, { data: assets }] = await Promise.all([
    supabase.from("outlier_creators").select("id, display_name").ilike("display_name", like).limit(5),
    supabase.from("outlier_posts").select("id, caption").ilike("caption", like).limit(5),
    supabase.from("signal_assets").select("id, filename").ilike("filename", like).limit(5),
  ]);

  return NextResponse.json({
    creators: (creators ?? []).map((c) => ({ id: c.id, label: c.display_name || "Unnamed creator" })),
    posts: (posts ?? []).map((p) => ({ id: p.id, label: (p.caption || "").slice(0, 60) || "Untitled post" })),
    assets: (assets ?? []).map((a) => ({ id: a.id, label: a.filename })),
  });
}
