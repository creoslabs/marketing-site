import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import sharp from "sharp";

const run = promisify(execFile);

export type VideoMetadata = {
  durationSeconds: number;
  width: number;
  height: number;
};

export async function probeVideo(filePath: string): Promise<VideoMetadata> {
  const { stdout } = await run(ffprobePath.path, [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);
  const parsed = JSON.parse(stdout);
  const videoStream = parsed.streams?.find((s: { codec_type: string }) => s.codec_type === "video");
  if (!videoStream) {
    throw new Error("No video stream found in uploaded file.");
  }
  return {
    durationSeconds: Number(parsed.format?.duration ?? videoStream.duration ?? 0),
    width: Number(videoStream.width),
    height: Number(videoStream.height),
  };
}

async function extractOneFrame(filePath: string, dir: string, t: number): Promise<Buffer> {
  const outPath = path.join(dir, `frame-${t}.jpg`);
  await run(ffmpegPath.path, [
    "-ss",
    String(t),
    "-i",
    filePath,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    "-vf",
    "scale=480:-1",
    "-y",
    outPath,
  ]);
  return readFile(outPath);
}

// Extracts one JPEG frame at each requested second offset, as raw bytes —
// callers use the same buffer both for Claude's vision request and for
// persisting the frame to Storage, since these are the only visual record
// Signal keeps of a video after analysis (see analyze/route.ts).
export async function extractFrames(filePath: string, timestamps: number[]): Promise<{ t: number; buffer: Buffer }[]> {
  const dir = await mkdtemp(path.join(tmpdir(), "signal-frames-"));
  try {
    const results = await Promise.all(
      timestamps.map(async (t) => {
        try {
          return { t, buffer: await extractOneFrame(filePath, dir, t) };
        } catch {
          // A fast seek can occasionally land past the last decodable frame
          // (duration rounding/keyframe imprecision) and write nothing —
          // retry a little earlier once rather than failing the whole
          // analysis over one frame.
          try {
            return { t, buffer: await extractOneFrame(filePath, dir, Math.max(0, t - 1)) };
          } catch {
            return null;
          }
        }
      })
    );
    const frames = results.filter((f): f is { t: number; buffer: Buffer } => f !== null);
    if (frames.length === 0) {
      throw new Error("Could not extract any frames from this video.");
    }
    return frames;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export type ImageMetadata = { width: number; height: number };

export async function probeImage(filePath: string): Promise<ImageMetadata> {
  const metadata = await sharp(filePath).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions.");
  }
  return { width: metadata.width, height: metadata.height };
}

export async function imageToDataUrl(filePath: string): Promise<string> {
  const resized = await sharp(filePath).resize({ width: 720, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  return `data:image/jpeg;base64,${resized.toString("base64")}`;
}
