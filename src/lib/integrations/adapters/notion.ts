import { ReconnectRequiredError, type Adapter } from "../types";

export const NOTION_VERSION = "2022-06-28";

export async function notionFetch(token: string, path: string, init?: { method?: string; body?: unknown }) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method: init?.method ?? "GET",
    headers: { authorization: `Bearer ${token}`, "notion-version": NOTION_VERSION, "content-type": "application/json" },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown> & { code?: string; message?: string };
  return { res, json };
}

// The columns every result page carries. Created on new databases and added
// to a picked database if missing, so a page write never fails on schema.
export const NOTION_PROPERTIES = {
  Name: { title: {} },
  Product: { select: {} },
  Score: { number: { format: "number" } },
  Date: { date: {} },
  Link: { url: {} },
} as const;

export async function ensureNotionSchema(token: string, databaseId: string) {
  const { res, json } = await notionFetch(token, `/databases/${databaseId}`);
  if (res.status === 401 || res.status === 404) throw new ReconnectRequiredError();
  if (!res.ok) throw new Error(json.message ?? `Notion said ${res.status}.`);
  const existing = (json.properties ?? {}) as Record<string, { type: string }>;
  const titleName = Object.entries(existing).find(([, p]) => p.type === "title")?.[0] ?? "Name";
  const missing: Record<string, unknown> = {};
  for (const [name, def] of Object.entries(NOTION_PROPERTIES)) {
    if (name === "Name") continue;
    if (!existing[name]) missing[name] = def;
  }
  if (Object.keys(missing).length > 0) {
    const patch = await notionFetch(token, `/databases/${databaseId}`, { method: "PATCH", body: { properties: missing } });
    if (!patch.res.ok) throw new Error(patch.json.message ?? `Notion said ${patch.res.status}.`);
  }
  return titleName;
}

const ARCHIVED = new Set(["object_not_found", "unauthorized", "restricted_resource"]);

export const notionAdapter: Adapter = {
  async send({ integration, secrets }, payload) {
    const token = secrets.notionAccessToken;
    const databaseId = integration.config.databaseId;
    if (!token || !databaseId) throw new ReconnectRequiredError();

    const isDigest = Boolean(payload.items && payload.items.length > 0);
    const title = isDigest ? `${payload.title} — ${payload.row.date}` : payload.row.item;
    const properties: Record<string, unknown> = {
      [integration.config.titleProperty ?? "Name"]: { title: [{ text: { content: title.slice(0, 200) } }] },
      Product: { select: { name: payload.row.product } },
      Date: { date: { start: payload.row.date } },
      Link: { url: payload.row.link },
    };
    if (payload.row.score !== null && !isDigest) properties.Score = { number: payload.row.score };

    const children = isDigest
      ? payload.items!.slice(0, 50).map((item) => ({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: item.headline.slice(0, 200), link: { url: item.href } } }, ...(item.detail ? [{ type: "text", text: { content: ` — ${item.detail}`.slice(0, 200) } }] : [])],
          },
        }))
      : payload.lines.slice(0, 6).map((line) => ({
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: line.slice(0, 1900) } }] },
        }));

    const { res, json } = await notionFetch(token, "/pages", {
      method: "POST",
      body: { parent: { database_id: databaseId }, properties, children },
    });
    if (res.ok) return;
    if (res.status === 401 || res.status === 403 || res.status === 404 || (json.code && ARCHIVED.has(json.code))) throw new ReconnectRequiredError();
    if (res.status === 429) throw new Error("Notion rate limit hit — will retry.");
    throw new Error(json.message ?? `Notion said ${res.status}.`);
  },
};
