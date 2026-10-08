import { ReconnectRequiredError, type Adapter, type ConnectionConfig } from "../types";

export const SHEET_HEADER = ["Date", "Product", "Item", "Score or multiple", "Link"];

export async function googleAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string; error?: string };
  if (!res.ok || !json.access_token) {
    if (json.error === "invalid_grant" || res.status === 400 || res.status === 401) throw new ReconnectRequiredError();
    throw new Error(`Google sign-in said ${res.status}.`);
  }
  return json.access_token;
}

export async function createSpreadsheet(accessToken: string, title: string): Promise<{ id: string; url: string }> {
  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({ properties: { title } }),
  });
  const json = (await res.json().catch(() => ({}))) as { spreadsheetId?: string; spreadsheetUrl?: string; error?: { message?: string } };
  if (!res.ok || !json.spreadsheetId) throw new Error(json.error?.message ?? `Couldn't create the Sheet (${res.status}).`);
  return { id: json.spreadsheetId, url: json.spreadsheetUrl ?? `https://docs.google.com/spreadsheets/d/${json.spreadsheetId}` };
}

export async function revokeGoogle(token: string | undefined) {
  if (!token) return;
  await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  }).catch(() => {});
}

export const sheetsAdapter: Adapter = {
  async send({ integration, secrets }, payload) {
    const refresh = secrets.googleRefreshToken;
    const config: ConnectionConfig = integration.config;
    if (!refresh || !config.sheetId) throw new ReconnectRequiredError();
    const accessToken = await googleAccessToken(refresh);

    // One row per result with fixed columns; header written on first use.
    const rows: (string | number)[][] = [];
    if (!config.headerWritten) rows.push(SHEET_HEADER);
    const items = payload.items && payload.items.length > 0 ? payload.items.map((i) => [payload.row.date, payload.row.product, i.headline, "", i.href]) : [[payload.row.date, payload.row.product, payload.row.item, payload.row.score ?? "", payload.row.link]];
    rows.push(...items);

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.sheetId)}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
        body: JSON.stringify({ values: rows }),
      }
    );
    if (res.status === 401 || res.status === 403 || res.status === 404) throw new ReconnectRequiredError();
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      throw new Error(json.error?.message ?? `Google Sheets said ${res.status}.`);
    }
  },
};
