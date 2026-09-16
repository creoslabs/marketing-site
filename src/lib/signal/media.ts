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

// Extracts one JPEG frame at each requested second offset. Returns each
// frame as a base64 data URL, ready to send straight to Claude's vision API.
export async function extractFrames(filePath: string, timestamps: number[]): Promise<{ t: number; dataUrl: string }[]> {
  const dir = await mkdtemp(path.join(tmpdir(), "signal-frames-"));
  try {
    const frames = await Promise.all(
      timestamps.map(async (t) => {
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
        const buffer = await readFile(outPath);
        return { t, dataUrl: `data:image/jpeg;base64,${buffer.toString("base64")}` };
      })
    );
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
