import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/integrations/http";
import { getRow, readSecrets, updateRow } from "@/lib/integrations/store";
import { ensureNotionSchema, notionFetch, NOTION_PROPERTIES } from "@/lib/integrations/adapters/notion";

type NotionTitle = { plain_text?: string }[];

function titleOf(title: NotionTitle | undefined, fallback: string) {
  return title?.map((t) => t.plain_text ?? "").join("").trim() || fallback;
}

// GET: the databases and pages the user granted on Notion's approve screen.
export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const row = await getRow(user.id, "notion");
  const token = row ? readSecrets(row).notionAccessToken : null;
  if (!row || !token) return NextResponse.json({ error: "Not connected." }, { status: 404 });

  const [dbs, pages] = await Promise.all([
    notionFetch(token, "/search", { method: "POST", body: { filter: { property: "object", value: "database" }, page_size: 50 } }),
    notionFetch(token, "/search", { method: "POST", body: { filter: { property: "object", value: "page" }, page_size: 10 } }),
  ]);
  if (dbs.res.status === 401) return NextResponse.json({ error: "Reconnect required." }, { status: 401 });
  const databases = ((dbs.json.results ?? []) as { id: string; title?: NotionTitle; url?: string }[]).map((d) => ({ id: d.id, name: titleOf(d.title, "Untitled database"), url: d.url ?? null }));
  const parents = ((pages.json.results ?? []) as { id: string; properties?: Record<string, { type: string; title?: NotionTitle }> }[]).map((p) => {
    const titleProp = Object.values(p.properties ?? {}).find((v) => v.type === "title");
    return { id: p.id, name: titleOf(titleProp?.title, "Untitled page") };
  });
  return NextResponse.json({ databases, pages: parents });
}

// POST { databaseId } picks an existing database; POST { create: true,
// parentPageId } creates a new one under a page the user granted.
export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const row = await getRow(user.id, "notion");
  const token = row ? readSecrets(row).notionAccessToken : null;
  if (!row || !token) return NextResponse.json({ error: "Not connected." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as { databaseId?: unknown; create?: unknown; parentPageId?: unknown } | null;

  try {
    let databaseId: string;
    let name: string;
    let url: string | undefined;
    if (body?.create === true) {
      if (typeof body.parentPageId !== "string") return NextResponse.json({ error: "Pick a page to create the database in." }, { status: 400 });
      const created = await notionFetch(token, "/databases", {
        method: "POST",
        body: { parent: { type: "page_id", page_id: body.parentPageId }, title: [{ type: "text", text: { content: "Creos Labs results" } }], properties: NOTION_PROPERTIES },
      });
      if (!created.res.ok) return NextResponse.json({ error: created.json.message ?? "Couldn't create the database." }, { status: 502 });
      databaseId = created.json.id as string;
      name = "Creos Labs results";
      url = created.json.url as string | undefined;
    } else if (typeof body?.databaseId === "string") {
      databaseId = body.databaseId;
      const found = await notionFetch(token, `/databases/${databaseId}`);
      if (!found.res.ok) return NextResponse.json({ error: "Creos Labs can't access that database. Share it with the integration in Notion." }, { status: 400 });
      name = titleOf(found.json.title as NotionTitle, "Untitled database");
      url = found.json.url as string | undefined;
    } else {
      return NextResponse.json({ error: "Pick a database." }, { status: 400 });
    }

    const titleProperty = await ensureNotionSchema(token, databaseId);
    await updateRow(row.id, {
      status: "connected",
      label: `${row.config.workspaceName ?? "Notion"} · ${name}`,
      config: { ...row.config, databaseId, databaseName: name, databaseUrl: url, titleProperty },
    });
    return NextResponse.json({ ok: true, name });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Couldn't set up that database." }, { status: 502 });
  }
}
