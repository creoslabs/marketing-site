export type Provider = "slack" | "email" | "sheets" | "notion";
export const PROVIDERS: Provider[] = ["slack", "email", "sheets", "notion"];

export type EventKey = "outlier_detected" | "weekly_digest" | "scorecard_completed" | "competitor_scored" | "delivery_problem";
export type Frequency = "instant" | "daily" | "weekly";
export type RouteSetting = { enabled: boolean; frequency: Frequency };

export type EventDef = {
  key: EventKey;
  product: "outlier" | "signal" | "all";
  label: string;
  // Frequencies a user may choose for chat/email destinations. Sheets and
  // Notion always write one row/page per result, so they only ever see
  // "instant" and don't show the frequency control.
  frequencies: Frequency[];
};

export const EVENTS: EventDef[] = [
  { key: "outlier_detected", product: "outlier", label: "Outlier detected", frequencies: ["instant", "daily", "weekly"] },
  { key: "weekly_digest", product: "outlier", label: "Weekly outlier digest", frequencies: ["weekly"] },
  { key: "scorecard_completed", product: "signal", label: "Scorecard completed", frequencies: ["instant", "daily", "weekly"] },
  { key: "competitor_scored", product: "signal", label: "Competitor ad scored", frequencies: ["instant", "daily", "weekly"] },
  { key: "delivery_problem", product: "all", label: "Delivery problem", frequencies: ["instant"] },
];

export const EVENT_BY_KEY = Object.fromEntries(EVENTS.map((e) => [e.key, e])) as Record<EventKey, EventDef>;

const on = (frequency: Frequency = "instant"): RouteSetting => ({ enabled: true, frequency });
const off = (frequency: Frequency = "instant"): RouteSetting => ({ enabled: false, frequency });

// Defaults per destination. A missing entry means that event is not
// available for that destination at all (shown as "—" in the brief) and is
// neither listed in Manage nor ever delivered there.
export const DEFAULT_ROUTING: Record<Provider, Partial<Record<EventKey, RouteSetting>>> = {
  slack: { outlier_detected: on(), weekly_digest: off("weekly"), scorecard_completed: on(), competitor_scored: on() },
  email: { outlier_detected: off(), weekly_digest: on("weekly"), scorecard_completed: off(), competitor_scored: off(), delivery_problem: on() },
  sheets: { outlier_detected: on(), scorecard_completed: on(), competitor_scored: on() },
  notion: { outlier_detected: off(), weekly_digest: on("weekly"), scorecard_completed: on(), competitor_scored: on() },
};

// Events that can never be switched off for a destination.
export const LOCKED_ON: Partial<Record<Provider, EventKey[]>> = { email: ["delivery_problem"] };

export function supportedEvents(provider: Provider): EventKey[] {
  return EVENTS.map((e) => e.key).filter((k) => DEFAULT_ROUTING[provider][k]);
}

export function resolveRouting(provider: Provider, stored: Record<string, Partial<RouteSetting>> | null | undefined): Partial<Record<EventKey, RouteSetting>> {
  const out: Partial<Record<EventKey, RouteSetting>> = {};
  for (const key of supportedEvents(provider)) {
    const def = DEFAULT_ROUTING[provider][key]!;
    const saved = stored?.[key];
    const frequencies = EVENT_BY_KEY[key].frequencies;
    const frequency = saved?.frequency && frequencies.includes(saved.frequency) ? saved.frequency : def.frequency;
    const locked = LOCKED_ON[provider]?.includes(key);
    out[key] = { enabled: locked ? true : typeof saved?.enabled === "boolean" ? saved.enabled : def.enabled, frequency };
  }
  return out;
}

export const PROVIDER_META: Record<Provider, { name: string; blurb: string }> = {
  slack: { name: "Slack", blurb: "Post formatted alerts and summaries to a channel." },
  email: { name: "Email", blurb: "Alerts and weekly digests to any inbox." },
  sheets: { name: "Google Sheets", blurb: "Append one row per result to a Sheet." },
  notion: { name: "Notion", blurb: "Create a page per result in a database you pick." },
};
