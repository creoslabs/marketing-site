import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Early-access requests from the website. Stored in the `waitlist` table
// (supabase/migrations/0021_waitlist.sql); a repeat email is accepted
// quietly rather than reported as an error.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // Supabase isn't configured (local development) — nothing to store into.
    return Response.json({ ok: true });
  }

  const { error } = await admin.from("waitlist").insert({ email });
  // 23505 = unique violation: this email already asked for access.
  if (error && error.code !== "23505") {
    console.error("waitlist insert failed", error.code);
    return Response.json({ error: "Couldn't save that just now. Please email hello@creos-labs.com." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
