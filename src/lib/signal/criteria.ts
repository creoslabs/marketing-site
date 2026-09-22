import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { SAFE_ZONE_CRITERION_NAME, SAFE_ZONE_THRESHOLDS, type Criterion, type Format, type Platform } from "@/app/signal/data";

const run = promisify(execFile);

// TikTok's own guidance: the first ~3s determines most of whether a viewer
// keeps watching. Meta's Reels hooks need to land even faster (0.5-1.5s per
// Meta's own playbook) since Reels autoplay into a denser, faster-scrolling
// feed — 2s is a workable middle of that range without being unmeasurably
// tight against 1-2s frame sampling.
export const HOOK_WINDOW_SECONDS: Record<Platform, number> = {
  TikTok: 3,
  Meta: 2,
};

// TikTok performs best short and direct-response-paced (9-15s optimal,
// research puts the outer sweet spot around 21-34s); Meta's Reels/Stories
// and Feed placements reward longer, up to 30-60s. Both numbers come from
// each platform's own 2026 creative guidance, not a shared assumption.
export const DURATION_THRESHOLDS: Record<Platform, { passSeconds: number; partialSeconds: number }> = {
  TikTok: { passSeconds: 15, partialSeconds: 34 },
  Meta: { passSeconds: 30, partialSeconds: 60 },
};

// The same product story is often cut roughly 2x faster on TikTok than the
// equivalent Reels edit — TikTok's pacing expectation is tighter.
export const CUT_PACE_THRESHOLDS: Record<Platform, { fastSeconds: number; moderateSeconds: number }> = {
  TikTok: { fastSeconds: 2, moderateSeconds: 4 },
  Meta: { fastSeconds: 3, moderateSeconds: 6 },
};

export function durationCriterion(durationSeconds: number, platform: Platform): Criterion {
  const { passSeconds, partialSeconds } = DURATION_THRESHOLDS[platform];
  const rounded = Math.round(durationSeconds);
  const label = `0:${String(rounded).padStart(2, "0")}`;
  return {
    name: "Duration",
    tier: 1,
    evidence: `${label} — ${platform} favours ≤${passSeconds}s`,
    verdict: rounded <= passSeconds ? "pass" : rounded <= partialSeconds ? "partial" : "fail",
  };
}

export function cutPaceCriterion(avgSecondsPerCut: number, platform: Platform): Criterion {
  const { fastSeconds, moderateSeconds } = CUT_PACE_THRESHOLDS[platform];
  return {
    name: "Cut frequency vs platform pacing",
    tier: 1,
    evidence: `Avg ${avgSecondsPerCut.toFixed(1)}s between cuts — ${platform} favours ≤${fastSeconds}s`,
    verdict: avgSecondsPerCut <= fastSeconds ? "pass" : avgSecondsPerCut <= moderateSeconds ? "partial" : "fail",
  };
}

// Shared shape for every "does X happen inside the hook window" criterion
// (motion/face/text detected, message clarity) — Claude reports the raw
// timestamp once; this turns it into a per-platform verdict without asking
// Claude to judge against a window it doesn't know the size of.
export function hookMomentCriterion(
  name: string,
  tier: 1 | 2,
  momentSeconds: number | null,
  platform: Platform,
  missingEvidence: string
): Criterion {
  const window = HOOK_WINDOW_SECONDS[platform];
  if (momentSeconds === null) {
    return { name, tier, evidence: missingEvidence, verdict: "fail" };
  }
  const within = momentSeconds <= window;
  return {
    name,
    tier,
    evidence: `0:${String(Math.round(momentSeconds)).padStart(2, "0")} — ${platform}'s hook window is ${window}s`,
    verdict: within ? (momentSeconds <= window / 2 ? "pass" : "partial") : "fail",
  };
}

// Claude reports where key content (text/logo/product) actually sits, once,
// regardless of platform — this turns that measurement into a per-platform
// verdict without a second vision call. A few points over the line is still
// "partial" (occasional/brief overlap); further over is a "fail".
export function safeZoneCriterion(
  maxTopIntrusionPct: number,
  maxBottomIntrusionPct: number,
  platform: Platform,
  format: Format
): Criterion {
  const { topPct, bottomPct } = SAFE_ZONE_THRESHOLDS[platform];
  const worstOver = Math.max(maxTopIntrusionPct - topPct, maxBottomIntrusionPct - bottomPct);
  const verdict: Criterion["verdict"] = worstOver <= 0 ? "pass" : worstOver <= 5 ? "partial" : "fail";
  return {
    name: SAFE_ZONE_CRITERION_NAME[format],
    tier: 1,
    evidence: `Key content reaches ${maxTopIntrusionPct}% from top, ${maxBottomIntrusionPct}% from bottom — ${platform}'s safe zone is ${topPct}%/${bottomPct}%`,
    verdict,
  };
}

// Criteria that are exactly measurable from file metadata don't need a
// vision model's judgment — computing them in code is both cheaper and
// more accurate than asking Claude to eyeball an aspect ratio.

export function aspectRatioCriterion(width: number, height: number, format: Format): Criterion {
  const ratio = width / height;
  const target = format === "video" ? 9 / 16 : 4 / 5;
  const withinTolerance = Math.abs(ratio - target) < 0.03;
  return {
    name: "Aspect ratio",
    tier: 1,
    evidence: `${width}×${height} (${ratio < 1 ? (1 / ratio).toFixed(2) : ratio.toFixed(2)}:1)`,
    verdict: withinTolerance ? "pass" : "partial",
  };
}

export function resolutionCriterion(width: number, height: number): Criterion {
  const minDimension = Math.min(width, height);
  return {
    name: "Resolution",
    tier: 1,
    evidence: `${width}×${height}`,
    verdict: minDimension >= 1080 ? "pass" : minDimension >= 720 ? "partial" : "fail",
  };
}

// Finds the first non-silent moment via ffmpeg's silencedetect filter —
// a real (if approximate) signal for "hook window audio onset" without
// needing a separate transcription service.
export async function detectAudioOnsetSeconds(filePath: string): Promise<number | null> {
  try {
    const { stderr } = await run(ffmpegPath.path, [
      "-i",
      filePath,
      "-af",
      "silencedetect=noise=-30dB:d=0.2",
      "-f",
      "null",
      "-",
    ]);
    const match = stderr.match(/silence_end: ([\d.]+)/);
    if (match) return parseFloat(match[1]);
    // No silence detected at all means audio starts at 0.
    if (stderr.includes("Stream") && !stderr.includes("silence_start")) return 0;
    return null;
  } catch {
    return null;
  }
}

export function audioOnsetCriterion(onsetSeconds: number | null, platform: Platform): Criterion {
  return hookMomentCriterion("Hook window audio onset", 1, onsetSeconds, platform, "No audio track detected");
}
