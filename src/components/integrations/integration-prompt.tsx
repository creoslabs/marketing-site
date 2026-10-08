import { getUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { providerConfigured } from "@/lib/integrations/config";
import { IntegrationPromptBar } from "./prompt-bar";

// Shows once, after the user has their first Signal score or first Outlier
// result and hasn't connected Slack: "Want these in Slack?" linking to the
// Slack card. Renders nothing otherwise, and never throws.
async function shouldPrompt(product: "outlier" | "signal"): Promise<boolean> {
  try {
    if (!providerConfigured("slack")) return false;
    const user = await getUser();
    if (!user || user.user_metadata?.integrations_prompt_dismissed) return false;

    const admin = createAdminClient();
    const { count: connected } = await admin.from("integrations").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("provider", "slack");
    if ((connected ?? 0) > 0) return false;

    let hasResult = false;
    if (product === "signal") {
      const { count } = await admin.from("signal_assets").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "done");
      hasResult = (count ?? 0) > 0;
    } else {
      const { data: handles } = await admin.from("outlier_handles").select("id").eq("user_id", user.id);
      const ids = (handles ?? []).map((h) => h.id as string);
      if (ids.length > 0) {
        const { count } = await admin.from("outlier_posts").select("id", { count: "exact", head: true }).in("handle_id", ids);
        hasResult = (count ?? 0) > 0;
      }
    }
    return hasResult;
  } catch {
    return false;
  }
}

export async function IntegrationPrompt({ product }: { product: "outlier" | "signal" }) {
  if (!(await shouldPrompt(product))) return null;
  return (
    <IntegrationPromptBar
      href={`/${product}/integrations#integration-slack`}
      text={product === "signal" ? "Want these in Slack? Send each scorecard to a channel the moment it’s done." : "Want these in Slack? Get an alert the moment a tracked creator breaks out."}
    />
  );
}
