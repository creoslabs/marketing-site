import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ notifications: [] }, { status: 401 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, href, read, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ notifications: data ?? [] });
}
