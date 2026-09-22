import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

// RLS's "update own repurposes" policy already scopes this to the caller's
// own row — no admin client or manual ownership check needed here.
export async function PATCH(request: Request, ctx: RouteContext<"/api/outlier/repurposes/[id]/share">) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const isPublic = Boolean(body?.isPublic);

  const supabase = await createClient();
  const { error } = await supabase.from("outlier_repurposes").update({ is_public: isPublic }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, isPublic });
}
