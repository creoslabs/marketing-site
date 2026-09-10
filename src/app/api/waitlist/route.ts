const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // TODO: once Supabase credentials for this project are available, insert
  // { email } into the waitlist table here (matching the creosapp.com pattern).
  // For now this just validates and acknowledges the signup.

  return Response.json({ ok: true });
}
