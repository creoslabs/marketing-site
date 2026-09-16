import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";

// Returns a signed Storage upload URL scoped to this user's own folder.
// The browser uploads the file bytes directly to Supabase from here —
// they never pass through this (or any) Vercel function, which matters
// since serverless function request bodies are capped well under the
// 500MB assets Signal is meant to accept.
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const filename = typeof body?.filename === "string" ? body.filename : null;
  if (!filename) {
    return NextResponse.json({ error: "Missing filename." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }

  const path = `${user.id}/${randomUUID()}/${filename}`;
  const { data, error } = await admin.storage.from("signal-assets").createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create upload URL." }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
