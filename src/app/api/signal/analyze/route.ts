import { NextResponse } from "next/server";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getVerifiedUser } from "@/lib/supabase/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { runVideoPipeline, runStaticPipeline } from "@/lib/signal/pipeline";
import { SAFE_ZONE_CRITERION_NAME, type Platform, type StaticFinding, type VideoFinding } from "@/app/signal/data";
import { shouldNotify } from "@/lib/notification-prefs";

const VALID_PLATFORMS: Platform[] = ["TikTok", "Meta"];

// Video analysis (ffmpeg + a Claude vision call per frame batch) can run
// well past Vercel's default 10s function timeout — this needs at least a
// Pro plan for the higher maxDuration to take effect.
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const storagePath = typeof body?.path === "string" ? body.path : null;
  const filename = typeof body?.filename === "string" ? body.filename : null;
  const format: "video" | "static" | null = body?.format === "video" || body?.format === "static" ? body.format : null;
  const platforms: Platform[] = Array.isArray(body?.platforms)
    ? body.platforms.filter((p: unknown): p is Platform => VALID_PLATFORMS.includes(p as Platform))
    : [];
  if (platforms.length === 0) platforms.push("Meta");
  const revisionOf = typeof body?.revisionOf === "string" ? body.revisionOf : null;

  if (!storagePath || !filename || !format) {
    return NextResponse.json({ error: "Missing path, filename, or format." }, { status: 400 });
  }
  if (!storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "That asset doesn't belong to this account." }, { status: 403 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not configured." }, { status: 503 });
  }

  if (revisionOf) {
    const { data: original } = await admin.from("signal_assets").select("user_id, format").eq("id", revisionOf).maybeSingle();
    if (!original || original.user_id !== user.id || original.format !== format) {
      return NextResponse.json({ error: "That original asset isn't valid to revise." }, { status: 400 });
    }
  }

  const { data: assetRow, error: insertError } = await admin
    .from("signal_assets")
    .insert({
      user_id: user.id,
      filename,
      format,
      platform: platforms[0],
      platforms,
      storage_path: storagePath,
      status: "processing",
      revision_of: revisionOf,
    })
    .select("id")
    .single();

  if (insertError || !assetRow) {
    return NextResponse.json({ error: insertError?.message ?? "Could not create asset." }, { status: 500 });
  }

  const assetId = assetRow.id as string;
  const tempPath = path.join(tmpdir(), `signal-${randomUUID()}${path.extname(filename)}`);

  try {
    const { data: fileBlob, error: downloadError } = await admin.storage.from("signal-assets").download(storagePath);
    if (downloadError || !fileBlob) {
      throw new Error(downloadError?.message ?? "Could not download uploaded file.");
    }
    await writeFile(tempPath, Buffer.from(await fileBlob.arrayBuffer()));

    const userApiKey =
      typeof user.user_metadata?.signal_anthropic_api_key === "string"
        ? user.user_metadata.signal_anthropic_api_key
        : null;
    const result =
      format === "video"
        ? await runVideoPipeline(tempPath, platforms, userApiKey)
        : await runStaticPipeline(tempPath, platforms, userApiKey);

    await admin
      .from("signal_assets")
      .update({
        status: "done",
        score: result.score,
        failed_checks: result.failedChecks,
        width: result.width,
        height: result.height,
        duration_seconds: result.durationSeconds ?? null,
        top_fix_title: result.topFix.title,
        top_fix_clears: result.topFix.clears,
        top_fix_body: result.topFix.body,
      })
      .eq("id", assetId);

    await admin.from("signal_criteria").insert(
      result.criteria.map((c, i) => ({
        asset_id: assetId,
        name: c.name,
        tier: c.tier,
        evidence: c.evidence,
        verdict: c.verdict,
        sort_order: i,
      }))
    );

    const safeZoneName = SAFE_ZONE_CRITERION_NAME[format];
    await admin.from("signal_platform_scores").insert(
      result.platformResults.map((p) => {
        const safeZone = p.criteria.find((c) => c.name === safeZoneName);
        return {
          asset_id: assetId,
          platform: p.platform,
          score: p.score,
          failed_checks: p.failedChecks,
          safe_zone_evidence: safeZone?.evidence ?? "",
          safe_zone_verdict: safeZone?.verdict ?? "partial",
        };
      })
    );

    if (format === "video") {
      const findings = result.findings as VideoFinding[];
      await admin.from("signal_findings").insert(
        findings.map((f, i) => ({
          asset_id: assetId,
          criterion_name: f.criterion,
          tier: f.tier,
          body: f.body,
          failure: f.failure,
          t: f.t,
          sort_order: i,
        }))
      );

      // Persist the sampled keyframes as the report's only visual record of
      // this video, then drop the original upload — Claude never analyzed
      // continuous video, only these frames, and they're a fraction of the
      // storage cost of the source file.
      const frames = result.frames ?? [];
      if (frames.length > 0) {
        // .upload() resolves with an { error } field on failure rather than
        // throwing — awaiting it without checking silently produced
        // signal_frames rows pointing at files that were never written,
        // and the report showed no preview at all for those assets.
        const uploads = await Promise.all(
          frames.map(async (frame) => {
            const framePath = `${user.id}/${assetId}/frames/${frame.t}.jpg`;
            const { error } = await admin.storage.from("signal-assets").upload(framePath, frame.buffer, {
              contentType: "image/jpeg",
              upsert: true,
            });
            return { t: frame.t, storagePath: framePath, error };
          })
        );

        const persisted = uploads.filter((u) => !u.error);
        if (persisted.length === 0) {
          throw new Error("Could not persist any keyframes for this video.");
        }

        const { error: framesInsertError } = await admin.from("signal_frames").insert(
          persisted.map((u) => ({
            asset_id: assetId,
            t: u.t,
            storage_path: u.storagePath,
          }))
        );
        if (framesInsertError) {
          throw new Error(`Could not save keyframe records: ${framesInsertError.message}`);
        }
        await admin.storage.from("signal-assets").remove([storagePath]);
      }
    } else {
      const findings = result.findings as StaticFinding[];
      await admin.from("signal_findings").insert(
        findings.map((f, i) => ({
          asset_id: assetId,
          criterion_name: f.criterion,
          tier: f.tier,
          body: f.body,
          failure: f.marker === "B",
          marker: f.marker,
          region_top: f.region.top,
          region_left: f.region.left,
          region_width: f.region.width,
          region_height: f.region.height,
          sort_order: i,
        }))
      );
    }

    if (await shouldNotify(admin, user.id, "analysis")) {
      await admin.from("notifications").insert({
        user_id: user.id,
        title: `Analysis complete — ${filename}`,
        body: `Scored ${result.score} · ${result.failedChecks} check${result.failedChecks === 1 ? "" : "s"} failing.`,
        href: `/signal/report/${assetId}`,
      });
    }

    return NextResponse.json({ assetId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    await admin.from("signal_assets").update({ status: "failed", error: message }).eq("id", assetId);
    if (await shouldNotify(admin, user.id, "analysis_failed")) {
      await admin.from("notifications").insert({
        user_id: user.id,
        title: `Analysis failed — ${filename}`,
        body: message,
        href: "/signal",
      });
    }
    return NextResponse.json({ error: message, assetId }, { status: 500 });
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}
