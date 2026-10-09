import { NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/supabase/data";
import { getAllPosts } from "@/app/outlier/live-data";

// Every post, ranked — fetched by the Feed only when someone turns the
// "Score ≥ 2× only" filter off (the Feed opens with just the outliers).
export async function GET() {
  const user = await getVerifiedUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ posts: await getAllPosts() });
}
