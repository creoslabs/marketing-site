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
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
});
