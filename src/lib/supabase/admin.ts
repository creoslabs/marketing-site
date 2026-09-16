import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for trusted server-only code (the analysis pipeline).
// It bypasses RLS entirely, so it must never be imported into anything that
// runs in the browser — Next.js will refuse to bundle SUPABASE_SERVICE_ROLE_KEY
// into client code since it isn't NEXT_PUBLIC_-prefixed, but keep this file
// server-only regardless (API routes / Server Components only).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client isn't configured — add SUPABASE_SERVICE_ROLE_KEY to .env.local (Settings -> API -> service_role secret)."
    );
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
