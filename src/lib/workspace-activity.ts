import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/data";

// Reads the timestamp of the user's previous Workspace visit (for a "since
// you were last here" recap), then immediately bumps it to now — so the
// value this returns is always the *previous* visit, never the current
// one. cache()-wrapped so calling it more than once in the same request
// (e.g. from generateMetadata and the page) only performs the update once.
export const getAndRecordLastVisit = cache(async (): Promise<string | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("user_activity").select("last_seen_at").eq("user_id", user.id).maybeSingle();
  const previous = data?.last_seen_at ?? null;

  await supabase.from("user_activity").upsert({ user_id: user.id, last_seen_at: new Date().toISOString() });

  return previous;
});
