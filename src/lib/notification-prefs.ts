import type { SupabaseClient } from "@supabase/supabase-js";

export const NOTIFICATION_CATEGORIES = [
  { key: "pull", label: "Pulls completed" },
  { key: "pull_failed", label: "Pulls failed" },
  { key: "analysis", label: "Analysis completed" },
  { key: "analysis_failed", label: "Analysis failed" },
  { key: "trend", label: "Trend alerts" },
  { key: "repurpose", label: "Repurposed scripts" },
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]["key"];

// Opt-out, not opt-in: a category counts as enabled unless the user has
// explicitly set it to false, so a user with no preferences row at all
// (the common case) gets every notification, matching today's behavior.
export async function shouldNotify(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this project doesn't generate a Database type for the Supabase client.
  admin: SupabaseClient<any>,
  userId: string,
  category: NotificationCategory
): Promise<boolean> {
  const { data } = await admin.from("notification_preferences").select("categories").eq("user_id", userId).maybeSingle();
  const categories = (data?.categories ?? {}) as Record<string, boolean>;
  return categories[category] !== false;
}
