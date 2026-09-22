import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name your collection." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outlier_collections")
    .insert({ user_id: user.id, name })
    .select("id, name")
    .single();

  if (error) {
    const message = error.code === "23505" ? "You already have a collection with that name." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, name: data.name });
}
