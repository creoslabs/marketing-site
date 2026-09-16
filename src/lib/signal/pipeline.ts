import { probeVideo, extractFrames, probeImage, imageToDataUrl } from "./media";
import { aspectRatioCriterion, resolutionCriterion, durationCriterion, audioOnsetCriterion, detectAudioOnsetSeconds } from "./criteria";
import { judgeVideoCriteria, judgeStaticCriteria } from "./claude";
import type { Criterion, StaticFinding, VideoFinding } from "@/app/signal/data";

export type PipelineResult = {
  score: number;
  failedChecks: number;
  width: number;
  height: number;
  durationSeconds?: number;
  criteria: Criterion[];
  findings: VideoFinding[] | StaticFinding[];
  topFix: { title: string; clears: number; body: string };
};

function computeScore(criteria: Criterion[]) {
  const pass = criteria.filter((c) => c.verdict === "pass").length;
  const partial = criteria.filter((c) => c.verdict === "partial").length;
  const fail = criteria.filter((c) => c.verdict === "fail").length;
  const score = Math.round(((pass + partial * 0.5) / criteria.length) * 100);
  return { score, failedChecks: fail };
}

export async function runVideoPipeline(filePath: string, apiKey?: string | null): Promise<PipelineResult> {
  const metadata = await probeVideo(filePath);
  const audioOnset = await detectAudioOnsetSeconds(filePath);

  const codeComputed: Criterion[] = [
    aspectRatioCriterion(metadata.width, metadata.height, "video"),
    resolutionCriterion(metadata.width, metadata.height),
    durationCriterion(metadata.durationSeconds),
    audioOnsetCriterion(audioOnset),
  ];

  // Sample evenly across the clip, capped at 12 frames to bound cost/latency.
  const roundedDuration = Math.max(1, Math.floor(metadata.durationSeconds));
  const sampleCount = Math.min(12, Math.max(4, roundedDuration + 1));
  const timestamps = [
    ...new Set(
      Array.from({ length: sampleCount }, (_, i) => Math.round((i / (sampleCount - 1)) * roundedDuration))
    ),
  ];
  const frames = await extractFrames(filePath, timestamps);

  const judged = await judgeVideoCriteria({
    frames,
    durationSeconds: metadata.durationSeconds,
    audioOnsetSeconds: audioOnset,
    apiKey,
  });

  const allCriteria = [...codeComputed, ...judged.criteria];
  const { score, failedChecks } = computeScore(allCriteria);

  return {
    score,
    failedChecks,
    width: metadata.width,
    height: metadata.height,
    durationSeconds: metadata.durationSeconds,
    criteria: allCriteria,
    findings: judged.findings,
    topFix: { title: judged.topFix.title, clears: judged.topFix.addressesCriteria.length, body: judged.topFix.body },
  };
}

export async function runStaticPipeline(filePath: string, apiKey?: string | null): Promise<PipelineResult> {
  const metadata = await probeImage(filePath);
  const codeComputed: Criterion[] = [
    aspectRatioCriterion(metadata.width, metadata.height, "static"),
    resolutionCriterion(metadata.width, metadata.height),
  ];

  const imageDataUrl = await imageToDataUrl(filePath);
  const judged = await judgeStaticCriteria({ imageDataUrl, apiKey });

  const allCriteria = [...codeComputed, ...judged.criteria];
  const { score, failedChecks } = computeScore(allCriteria);

  return {
    score,
    failedChecks,
    width: metadata.width,
    height: metadata.height,
    criteria: allCriteria,
    findings: judged.findings,
    topFix: { title: judged.topFix.title, clears: judged.topFix.addressesCriteria.length, body: judged.topFix.body },
  };
}
