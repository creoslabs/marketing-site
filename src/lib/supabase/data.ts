import { cache } from "react";
import { createClient } from "./server";

// proxy.ts already calls supabase.auth.getUser() — a network round-trip that
// revalidates the token against Supabase and refreshes the session cookies —
// on every request, and redirects unauthenticated visitors before they ever
// reach a protected route. Server Components downstream only need to read
// that already-verified session locally; calling getUser() again here would
// repeat the same network round-trip on every render, which is what made
// switching tabs in the workspace feel slow (proxy + layout + page were each
// hitting Supabase separately). getSession() reads the refreshed cookie with
// no network call. cache() further dedupes repeat calls within one request.
export const getUser = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user ?? null;
  } catch {
    // Supabase isn't configured yet (placeholder .env.local values) —
    // createClient() throws synchronously on an invalid URL. No one can
    // possibly be signed in without real credentials, so treat this the
    // same as "not signed in" rather than crashing every caller.
    return null;
  }
});

// getSession() above trusts whatever's in the request's cookies without
// verifying the JWT against Supabase's Auth server — fine for page renders,
// where every actual data query still goes through the RLS-scoped client
// and gets independently re-verified at the database layer regardless of
// what this function returns. It is NOT fine for API routes that use
// createAdminClient() (service role, bypasses RLS entirely): there, this
// user object is the *only* thing standing between one account's data and
// another's, so it must be cryptographically real. proxy.ts calls the real,
// server-verified supabase.auth.getUser() on every request — but only for
// page routes matching PROTECTED_ROUTES; every /api/* request skips that
// check (isProtected only matches bare /workspace, /outlier, /signal,
// /dashboard prefixes, not /api/outlier/... or /api/signal/...). So any
// route that hands the caller's user.id to an admin client — analyze,
// favourite, repurpose, the outlier pull routes, signal's analyze and
// upload-url — must call this instead.
export const getVerifiedUser = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});

type NamedUser = { email?: string | null; user_metadata?: { full_name?: unknown } | null } | null;

// Prefers the real display name set via the Account tab (stored in Supabase
// auth's user_metadata); falls back to a name derived from the email's local
// part for accounts that haven't set one yet.
export function getDisplayName(user: NamedUser) {
  const fullName = user?.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }
  const localPart = user?.email?.split("@")[0] ?? "";
  return (
    localPart
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ") || "Account"
  );
}
