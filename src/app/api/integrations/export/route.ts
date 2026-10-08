import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { csvResponse, toCsv } from "@/lib/integrations/csv";
import { requireUser, unauthorized } from "@/lib/integrations/http";
import { appLink } from "@/lib/integrations/links";

// CSV download for any list or scorecard — needs no connection.
//   ?kind=signal-library         every scored asset
//   ?kind=signal-asset&id=<id>   one scorecard, criterion by criterion
//   ?kind=outlier-feed           every pulled post with its multiple of median
export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  if (kind === "signal-library") {
    const { data } = await admin
      .from("signal_assets")
      .select("id, filename, format, score, failed_checks, created_at")
      .eq("user_id", user.id)
      .eq("status", "done")
      .order("created_at", { ascending: false });
    return csvResponse(
      `signal-library-${today}.csv`,
      toCsv(
        ["Date", "Item", "Format", "Score", "Failed checks", "Link"],
        (data ?? []).map((a) => [String(a.created_at).slice(0, 10), a.filename, a.format, a.score, a.failed_checks, appLink("signal", `/report/${a.id}`)])
      )
    );
  }

  if (kind === "signal-asset") {
    const id = url.searchParams.get("id") ?? "";
    const { data: asset } = await admin.from("signal_assets").select("id, filename, score").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (!asset) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const { data: criteria } = await admin.from("signal_criteria").select("name, tier, verdict, evidence").eq("asset_id", id).order("sort_order", { ascending: true });
    return csvResponse(
      `signal-scorecard-${String(asset.filename).replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}-${today}.csv`,
      toCsv(
        ["Criterion", "Tier", "Verdict", "Evidence"],
        (criteria ?? []).map((c) => [c.name, c.tier === 1 ? "Structural" : "Contextual", c.verdict, c.evidence])
      )
    );
  }

  if (kind === "outlier-feed") {
    const { data: handles } = await admin.from("outlier_handles").select("id, handle, platform").eq("user_id", user.id);
    const ids = (handles ?? []).map((h) => h.id as string);
    const { data: posts } = ids.length
      ? await admin.from("outlier_posts").select("id, handle_id, views, caption, posted_at").in("handle_id", ids).order("posted_at", { ascending: false })
      : { data: [] as { id: string; handle_id: string; views: number; caption: string | null; posted_at: string }[] };
    const byHandle = new Map<string, number[]>();
    for (const p of posts ?? []) byHandle.set(p.handle_id, [...(byHandle.get(p.handle_id) ?? []), Number(p.views)]);
    const median = (nums: number[]) => {
      const s = [...nums].sort((a, b) => a - b);
      return s.length === 0 ? 0 : s.length % 2 === 0 ? (s[s.length / 2 - 1] + s[s.length / 2]) / 2 : s[(s.length - 1) / 2];
    };
    const meta = new Map((handles ?? []).map((h) => [h.id as string, h]));
    return csvResponse(
      `outlier-feed-${today}.csv`,
      toCsv(
        ["Date posted", "Creator", "Platform", "Views", "Multiple of median", "Caption", "Link"],
        (posts ?? []).map((p) => {
          const m = median(byHandle.get(p.handle_id) ?? []);
          return [String(p.posted_at).slice(0, 10), `@${meta.get(p.handle_id)?.handle ?? ""}`, meta.get(p.handle_id)?.platform, p.views, m > 0 ? Math.round((Number(p.views) / m) * 10) / 10 : "", p.caption, appLink("outlier", `/video/${p.id}`)];
        })
      )
    );
  }

  return NextResponse.json({ error: "Unknown export." }, { status: 400 });
}
