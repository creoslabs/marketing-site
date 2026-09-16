import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import type { Criterion, Format } from "@/app/signal/data";

const run = promisify(execFile);

export const HOOK_WINDOW_SECONDS = 4;

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

export function durationCriterion(durationSeconds: number): Criterion {
  const rounded = Math.round(durationSeconds);
  const label = `0:${String(rounded).padStart(2, "0")}`;
  return {
    name: "Duration",
    tier: 1,
    evidence: rounded <= 15 ? `${label}, within platform pacing` : `${label}, platform favours <15s`,
    verdict: rounded <= 15 ? "pass" : rounded <= 30 ? "partial" : "fail",
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

export function audioOnsetCriterion(onsetSeconds: number | null): Criterion {
  if (onsetSeconds === null) {
    return {
      name: "Hook window audio onset",
      tier: 1,
      evidence: "No audio track detected",
      verdict: "fail",
    };
  }
  const withinWindow = onsetSeconds <= HOOK_WINDOW_SECONDS;
  return {
    name: "Hook window audio onset",
    tier: 1,
    evidence: `Onset at 0:${String(Math.round(onsetSeconds)).padStart(2, "0")}${withinWindow ? "" : ", after the hook window"}`,
    verdict: withinWindow ? (onsetSeconds <= HOOK_WINDOW_SECONDS / 2 ? "pass" : "partial") : "fail",
  };
}
