import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

// Lightweight list used by the Compare picker — id/filename/score only, no
// signed preview URLs, since the picker just needs names to choose between.
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ assets: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  if (format !== "video" && format !== "static") {
    return NextResponse.json({ error: "format must be 'video' or 'static'." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("signal_assets")
    .select("id, filename, score")
    .eq("format", format)
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .returns<{ id: string; filename: string; score: number | null }[]>();

  return NextResponse.json({
    assets: (data ?? []).map((a) => ({ id: a.id, filename: a.filename, score: a.score ?? 0 })),
  });
}
