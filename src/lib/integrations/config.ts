import type { Provider } from "./events";

// Which providers have their server-side credentials configured. A provider
// with missing credentials still renders its card, but Connect is disabled
// instead of leading to a broken OAuth screen.
const REQUIRED_ENV: Record<Provider, string[]> = {
  slack: ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET"],
  email: ["RESEND_API_KEY", "EMAIL_FROM"],
  sheets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  notion: ["NOTION_CLIENT_ID", "NOTION_CLIENT_SECRET"],
};

export function providerConfigured(provider: Provider): boolean {
  if (!process.env.INTEGRATIONS_ENCRYPTION_KEY) return false;
  return REQUIRED_ENV[provider].every((name) => Boolean(process.env[name]));
}

// Public base URL of the root app. OAuth redirect URIs always point at the
// root host (one fixed URL to register with each provider), whichever
// product the user started from.
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://www.creos-labs.com" : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}

export function redirectUri(provider: "slack" | "sheets" | "notion"): string {
  return `${siteUrl()}/api/integrations/${provider}/callback`;
}
