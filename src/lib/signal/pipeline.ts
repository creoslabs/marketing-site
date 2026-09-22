import { probeVideo, extractFrames, probeImage, imageToDataUrl } from "./media";
import {
  aspectRatioCriterion,
  resolutionCriterion,
  durationCriterion,
  audioOnsetCriterion,
  detectAudioOnsetSeconds,
  safeZoneCriterion,
} from "./criteria";
import { judgeVideoCriteria, judgeStaticCriteria } from "./claude";
import type { Criterion, Platform, StaticFinding, VideoFinding } from "@/app/signal/data";

export type PlatformResult = { platform: Platform; score: number; failedChecks: number; criteria: Criterion[] };

export type PipelineResult = {
  // The primary platform's (platforms[0]) score/criteria — kept at the top
  // level since most of the app (library list, benchmarks, notifications)
  // only ever cares about one number per asset. Every targeted platform's
  // full result, primary included, is also in platformResults.
  score: number;
  failedChecks: number;
  width: number;
  height: number;
  durationSeconds?: number;
  criteria: Criterion[];
  platformResults: PlatformResult[];
  findings: VideoFinding[] | StaticFinding[];
  topFix: { title: string; clears: number; body: string };
  frames?: { t: number; buffer: Buffer }[];
};

function computeScore(criteria: Criterion[]) {
  const pass = criteria.filter((c) => c.verdict === "pass").length;
  const partial = criteria.filter((c) => c.verdict === "partial").length;
  const fail = criteria.filter((c) => c.verdict === "fail").length;
  const score = Math.round(((pass + partial * 0.5) / criteria.length) * 100);
  return { score, failedChecks: fail };
}

// Safe-zone slots in right after the code-computed criteria, matching where
// it sat in the old fixed judged-criteria list (first tier-1 judged item) —
// everything else about the criteria order/grouping stays exactly as before.
function buildPlatformResults(
  codeComputed: Criterion[],
  judgedCriteria: Criterion[],
  platforms: Platform[],
  safeZoneMeasurement: { maxTopIntrusionPct: number; maxBottomIntrusionPct: number },
  format: "video" | "static"
): PlatformResult[] {
  return platforms.map((platform) => {
    const safeZone = safeZoneCriterion(
      safeZoneMeasurement.maxTopIntrusionPct,
      safeZoneMeasurement.maxBottomIntrusionPct,
      platform,
      format
    );
    const criteria = [...codeComputed, safeZone, ...judgedCriteria];
    const { score, failedChecks } = computeScore(criteria);
    return { platform, score, failedChecks, criteria };
  });
}

export async function runVideoPipeline(filePath: string, platforms: Platform[], apiKey?: string | null): Promise<PipelineResult> {
  const metadata = await probeVideo(filePath);
  const audioOnset = await detectAudioOnsetSeconds(filePath);

  const codeComputed: Criterion[] = [
    aspectRatioCriterion(metadata.width, metadata.height, "video"),
    resolutionCriterion(metadata.width, metadata.height),
    durationCriterion(metadata.durationSeconds),
    audioOnsetCriterion(audioOnset),
  ];

  // Sample evenly across the clip, capped at 12 frames to bound cost/latency.
  // The last sample is clamped a little short of the real duration — a fast
  // seek requested right at (or past) the final decodable frame can overshoot
  // end-of-stream and come back empty, depending on the container/keyframes.
  const roundedDuration = Math.max(1, Math.floor(metadata.durationSeconds));
  const safeMax = Math.max(0, Math.min(roundedDuration, metadata.durationSeconds - 0.5));
  const sampleCount = Math.min(12, Math.max(4, roundedDuration + 1));
  const timestamps = [
    ...new Set(
      Array.from({ length: sampleCount }, (_, i) => Math.round((i / (sampleCount - 1)) * safeMax))
    ),
  ];
  const frames = await extractFrames(filePath, timestamps);

  const judged = await judgeVideoCriteria({
    frames,
    durationSeconds: metadata.durationSeconds,
    audioOnsetSeconds: audioOnset,
    apiKey,
  });

  const platformResults = buildPlatformResults(codeComputed, judged.criteria, platforms, judged.safeZoneMeasurement, "video");
  const primary = platformResults[0];

  return {
    score: primary.score,
    failedChecks: primary.failedChecks,
    width: metadata.width,
    height: metadata.height,
    durationSeconds: metadata.durationSeconds,
    criteria: primary.criteria,
    platformResults,
    findings: judged.findings,
    topFix: { title: judged.topFix.title, clears: judged.topFix.addressesCriteria.length, body: judged.topFix.body },
    frames,
  };
}

export async function runStaticPipeline(filePath: string, platforms: Platform[], apiKey?: string | null): Promise<PipelineResult> {
  const metadata = await probeImage(filePath);
  const codeComputed: Criterion[] = [
    aspectRatioCriterion(metadata.width, metadata.height, "static"),
    resolutionCriterion(metadata.width, metadata.height),
  ];

  const imageDataUrl = await imageToDataUrl(filePath);
  const judged = await judgeStaticCriteria({ imageDataUrl, apiKey });

  const platformResults = buildPlatformResults(codeComputed, judged.criteria, platforms, judged.safeZoneMeasurement, "static");
  const primary = platformResults[0];

  return {
    score: primary.score,
    failedChecks: primary.failedChecks,
    width: metadata.width,
    height: metadata.height,
    criteria: primary.criteria,
    platformResults,
    findings: judged.findings,
    topFix: { title: judged.topFix.title, clears: judged.topFix.addressesCriteria.length, body: judged.topFix.body },
  };
}
