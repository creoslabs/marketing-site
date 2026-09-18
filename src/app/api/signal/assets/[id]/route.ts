import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/signal/assets/[id]">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const supabase = await createClient();

  // RLS scopes this to the caller's own assets — a foreign or missing id
  // both come back as no row, which we report identically as 404.
  const { data: asset } = await supabase
    .from("signal_assets")
    .select("format, storage_path")
    .eq("id", id)
    .single();

  if (!asset) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  // Storage objects aren't cascade-deleted with the row — clean them up
  // explicitly. Videos keep no original file after analysis (see
  // analyze/route.ts); their only visual record is the persisted keyframes.
  if (asset.format === "video") {
    const { data: frames } = await supabase.from("signal_frames").select("storage_path").eq("asset_id", id);
    const paths = (frames ?? []).map((f) => f.storage_path);
    if (paths.length > 0) {
      await supabase.storage.from("signal-assets").remove(paths);
    }
  } else {
    await supabase.storage.from("signal-assets").remove([asset.storage_path]);
  }

  const { error: deleteError } = await supabase.from("signal_assets").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
