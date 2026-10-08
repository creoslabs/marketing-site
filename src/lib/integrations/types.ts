import type { EventKey, Provider, RouteSetting } from "./events";

// What every adapter receives. No secrets in here — it's stored in the
// delivery log and used to render a provider-specific message at send time.
export type DeliveryItem = { headline: string; detail?: string; href: string; thumbnailUrl?: string | null };

export type DeliveryPayload = {
  event: EventKey | "test";
  product: "outlier" | "signal" | "creos";
  // Short label for the message type, e.g. "Scorecard ready".
  title: string;
  // The verdict, led first: the score or "3.4× their median".
  headline: string;
  // Evidence lines (3–4), then the button.
  lines: string[];
  thumbnailUrl?: string | null;
  href: string;
  ctaLabel: string;
  // Fixed sheet/Notion columns.
  row: { date: string; product: string; item: string; score: number | null; link: string };
  // Set on digests (several results in one message).
  items?: DeliveryItem[];
};

export type EmailAddress = { email: string; confirmed: boolean; disabled?: string };

export type ConnectionConfig = {
  // Slack
  teamId?: string;
  teamName?: string;
  channel?: string;
  // Email
  addresses?: EmailAddress[];
  // Sheets
  sheetId?: string;
  sheetUrl?: string;
  sheetName?: string;
  headerWritten?: boolean;
  // Notion
  workspaceName?: string;
  databaseId?: string;
  databaseName?: string;
  databaseUrl?: string;
  titleProperty?: string;
};

export type IntegrationRow = {
  id: string;
  user_id: string;
  provider: Provider;
  status: "connected" | "attention";
  label: string | null;
  config: ConnectionConfig;
  routing: Record<string, Partial<RouteSetting>>;
  secrets_encrypted: string | null;
};

export type ProviderSecrets = {
  slackWebhookUrl?: string;
  slackBotToken?: string;
  googleRefreshToken?: string;
  notionAccessToken?: string;
};

// A failure that retrying won't fix — the token is revoked/expired or access
// was lost — so the card flips to "Reconnect required".
export class ReconnectRequiredError extends Error {
  constructor(message = "Reconnect required") {
    super(message);
    this.name = "ReconnectRequiredError";
  }
}

export type AdapterContext = { integration: IntegrationRow; secrets: ProviderSecrets };

export type Adapter = {
  send(ctx: AdapterContext, payload: DeliveryPayload): Promise<void>;
};
