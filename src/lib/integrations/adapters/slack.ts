import { ReconnectRequiredError, type Adapter, type DeliveryPayload } from "../types";

const PRODUCT_TAG = { outlier: "OUTLIER", signal: "SIGNAL", creos: "CREOS LABS" } as const;

type Block = Record<string, unknown>;

// Lead with the verdict, then the evidence, then one "Open in …" button.
// Kept to a thumbnail plus 4 lines (verdict + 3 evidence); the detail lives in the app.
export function slackBlocks(payload: DeliveryPayload): Block[] {
  const tag = PRODUCT_TAG[payload.product];
  const blocks: Block[] = [{ type: "context", elements: [{ type: "mrkdwn", text: `*${tag}* · ${payload.title}` }] }];

  if (payload.items && payload.items.length > 0) {
    const list = payload.items
      .slice(0, 8)
      .map((item, i) => `${i + 1}. <${item.href}|${escapeMrkdwn(item.headline)}>${item.detail ? ` — ${escapeMrkdwn(item.detail)}` : ""}`)
      .join("\n");
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*${escapeMrkdwn(payload.headline)}*\n${list}` } });
  } else {
    const section: Block = {
      type: "section",
      text: { type: "mrkdwn", text: [`*${escapeMrkdwn(payload.headline)}*`, ...payload.lines.slice(0, 3).map(escapeMrkdwn)].join("\n") },
    };
    if (payload.thumbnailUrl) section.accessory = { type: "image", image_url: payload.thumbnailUrl, alt_text: payload.headline };
    blocks.push(section);
  }

  blocks.push({
    type: "actions",
    elements: [{ type: "button", text: { type: "plain_text", text: payload.ctaLabel }, url: payload.href }],
  });
  return blocks;
}

function escapeMrkdwn(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Webhook errors that mean the install is gone rather than a blip.
const REVOKED = new Set(["invalid_token", "no_service", "channel_not_found", "channel_is_archived", "action_prohibited", "team_disabled", "account_inactive"]);

export const slackAdapter: Adapter = {
  async send({ secrets }, payload) {
    const url = secrets.slackWebhookUrl;
    if (!url) throw new ReconnectRequiredError();
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `${payload.title} — ${payload.headline}`, blocks: slackBlocks(payload) }),
    });
    if (res.ok) return;
    const text = (await res.text().catch(() => "")).trim();
    if (res.status === 429) {
      const wait = res.headers.get("retry-after");
      throw new Error(`Slack rate limit hit${wait ? ` — retry in ${wait}s` : ""}.`);
    }
    if (res.status === 403 || res.status === 404 || res.status === 410 || REVOKED.has(text)) throw new ReconnectRequiredError();
    throw new Error(`Slack said ${res.status}${text ? `: ${text}` : ""}.`);
  },
};

// Revokes the bot token on disconnect, where Slack has an API for it.
export async function revokeSlack(botToken: string | undefined) {
  if (!botToken) return;
  await fetch("https://slack.com/api/auth.revoke", { method: "POST", headers: { authorization: `Bearer ${botToken}` } }).catch(() => {});
}
