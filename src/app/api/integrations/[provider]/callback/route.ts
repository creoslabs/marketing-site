import { NextResponse } from "next/server";
import { redirectUri } from "@/lib/integrations/config";
import { verifyToken } from "@/lib/integrations/crypto";
import { integrationsReturnUrl, parseProduct, parseProvider, requireUser, type ProductSlug } from "@/lib/integrations/http";
import { getRow, saveConnection } from "@/lib/integrations/store";
import { createSpreadsheet, googleAccessToken } from "@/lib/integrations/adapters/sheets";

type State = { u: string; p: string; r: string; n: string };

function back(request: Request, product: ProductSlug, params: Record<string, string>) {
  return NextResponse.redirect(integrationsReturnUrl(request, product, params));
}

// Provider redirects land here with ?code=&state=. The signed state proves
// who started the flow and which product to return to; the signed-in
// session must match it. Tokens go straight into encrypted storage and are
// never echoed back to the browser.
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const provider = parseProvider((await params).provider);
  const url = new URL(request.url);
  const state = verifyToken<State>(url.searchParams.get("state"));
  const product = parseProduct(state?.r);
  if (!provider || provider === "email" || !state || state.p !== provider) {
    return back(request, product, { error: "That connection link expired. Try connecting again.", provider: provider ?? "" });
  }

  const user = await requireUser();
  if (!user || user.id !== state.u) {
    return back(request, product, { error: "Sign in to the same account and try connecting again.", provider });
  }

  if (url.searchParams.get("error")) {
    return back(request, product, { error: "Connection was cancelled.", provider });
  }
  const code = url.searchParams.get("code");
  if (!code) return back(request, product, { error: "The provider didn't return an authorisation code.", provider });

  try {
    if (provider === "slack") {
      const res = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          redirect_uri: redirectUri("slack"),
          client_id: process.env.SLACK_CLIENT_ID ?? "",
          client_secret: process.env.SLACK_CLIENT_SECRET ?? "",
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        access_token?: string;
        team?: { id: string; name: string };
        incoming_webhook?: { url: string; channel: string };
      };
      if (!json.ok || !json.incoming_webhook) throw new Error(json.error === "access_denied" ? "Connection was cancelled." : "Slack didn't return a channel. Pick one on Slack's approve screen.");
      const channel = json.incoming_webhook.channel;
      await saveConnection({
        userId: user.id,
        provider,
        label: `${json.team?.name ?? "Slack"} · ${channel}`,
        config: { teamId: json.team?.id, teamName: json.team?.name, channel },
        secrets: { slackWebhookUrl: json.incoming_webhook.url, slackBotToken: json.access_token },
      });
    } else if (provider === "sheets") {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID ?? "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          redirect_uri: redirectUri("sheets"),
          grant_type: "authorization_code",
        }),
      });
      const tokens = (await tokenRes.json()) as { refresh_token?: string; error?: string };
      if (!tokenRes.ok || !tokens.refresh_token) {
        throw new Error("Google didn't return access. Remove Creos Labs from your Google account's third-party access and connect again.");
      }
      const existing = await getRow(user.id, "sheets");
      let config = { sheetId: existing?.config.sheetId, sheetUrl: existing?.config.sheetUrl, sheetName: existing?.config.sheetName, headerWritten: existing?.config.headerWritten };
      // Reconnecting keeps the existing Sheet; a first connect creates one.
      if (!config.sheetId) {
        const sheetName = state.n || "Creos Labs results";
        const sheet = await createSpreadsheet(await googleAccessToken(tokens.refresh_token), sheetName);
        config = { sheetId: sheet.id, sheetUrl: sheet.url, sheetName, headerWritten: false };
      }
      await saveConnection({
        userId: user.id,
        provider,
        label: config.sheetName ?? "Google Sheet",
        config,
        secrets: { googleRefreshToken: tokens.refresh_token },
      });
    } else {
      const basic = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64");
      const res = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: { authorization: `Basic ${basic}`, "content-type": "application/json", "notion-version": "2022-06-28" },
        body: JSON.stringify({ grant_type: "authorization_code", code, redirect_uri: redirectUri("notion") }),
      });
      const json = (await res.json()) as { access_token?: string; workspace_name?: string; error?: string };
      if (!res.ok || !json.access_token) throw new Error("Notion didn't grant access. Try connecting again.");
      const existing = await getRow(user.id, "notion");
      await saveConnection({
        userId: user.id,
        provider,
        label: json.workspace_name ?? "Notion",
        config: { workspaceName: json.workspace_name },
        secrets: { notionAccessToken: json.access_token },
      });
      return back(request, product, { connected: provider, ...(existing?.config.databaseId ? {} : { setup: "1" }) });
    }
  } catch (err) {
    return back(request, product, { error: err instanceof Error ? err.message : "Couldn't connect.", provider });
  }

  return back(request, product, { connected: provider });
}
