import { probeVideo, extractFrames, probeImage, imageToDataUrl } from "./media";
import {
  aspectRatioCriterion,
  resolutionCriterion,
  durationCriterion,
  audioOnsetCriterion,
  cutPaceCriterion,
  hookMomentCriterion,
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

// Video has eight platform-varying criteria (duration, hook-window audio
// onset, safe zone, cut pace, and the four "does X happen in the hook
// window" checks) built here from Claude's raw measurements plus ffmpeg's
// duration/audio-onset probes — everything else is judged once and shared
// across every platform the asset targets.
function buildVideoPlatformResults(
  codeComputed: Criterion[],
  sharedJudgedCriteria: Criterion[],
  platforms: Platform[],
  durationSeconds: number,
  audioOnsetSeconds: number | null,
  safeZoneMeasurement: { maxTopIntrusionPct: number; maxBottomIntrusionPct: number },
  hookMeasurements: {
    avgSecondsPerCut: number;
    motionTimestampSeconds: number | null;
    faceTimestampSeconds: number | null;
    textOnScreenTimestampSeconds: number | null;
    messageClarityTimestampSeconds: number | null;
  }
): PlatformResult[] {
  return platforms.map((platform) => {
    const platformVarying = [
      durationCriterion(durationSeconds, platform),
      audioOnsetCriterion(audioOnsetSeconds, platform),
      safeZoneCriterion(safeZoneMeasurement.maxTopIntrusionPct, safeZoneMeasurement.maxBottomIntrusionPct, platform, "video"),
      cutPaceCriterion(hookMeasurements.avgSecondsPerCut, platform),
      hookMomentCriterion("Hook window motion detected", 1, hookMeasurements.motionTimestampSeconds, platform, "No motion detected"),
      hookMomentCriterion("Hook window face detected", 1, hookMeasurements.faceTimestampSeconds, platform, "No face detected"),
      hookMomentCriterion("Hook window text on screen", 1, hookMeasurements.textOnScreenTimestampSeconds, platform, "No on-screen text detected"),
      hookMomentCriterion("Message clarity in hook window", 2, hookMeasurements.messageClarityTimestampSeconds, platform, "Message never becomes clear"),
    ];
    const criteria = [...codeComputed, ...platformVarying, ...sharedJudgedCriteria];
    const { score, failedChecks } = computeScore(criteria);
    return { platform, score, failedChecks, criteria };
  });
}

// Static has only one platform-varying criterion (safe zone) — everything
// else about a still image's best practices doesn't depend on the platform.
function buildStaticPlatformResults(
  codeComputed: Criterion[],
  sharedJudgedCriteria: Criterion[],
  platforms: Platform[],
  safeZoneMeasurement: { maxTopIntrusionPct: number; maxBottomIntrusionPct: number }
): PlatformResult[] {
  return platforms.map((platform) => {
    const safeZone = safeZoneCriterion(safeZoneMeasurement.maxTopIntrusionPct, safeZoneMeasurement.maxBottomIntrusionPct, platform, "static");
    const criteria = [...codeComputed, safeZone, ...sharedJudgedCriteria];
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

  const platformResults = buildVideoPlatformResults(
    codeComputed,
    judged.criteria,
    platforms,
    metadata.durationSeconds,
    audioOnset,
    judged.safeZoneMeasurement,
    judged.hookMeasurements
  );
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

  const platformResults = buildStaticPlatformResults(codeComputed, judged.criteria, platforms, judged.safeZoneMeasurement);
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
