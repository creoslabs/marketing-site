import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import Anthropic from "@anthropic-ai/sdk";

const run = promisify(execFile);

function getGroqKey(overrideKey?: string | null) {
  const key = overrideKey || process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "No Groq API key available — set one on the Account tab (Testing -> API Keys) or add GROQ_API_KEY to .env.local."
    );
  }
  return key;
}

function getAnthropicClient(overrideKey?: string | null) {
  const apiKey = overrideKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No Anthropic API key available — set one on the Account tab (Testing -> API Keys) or add ANTHROPIC_API_KEY to .env.local."
    );
  }
  return new Anthropic({ apiKey });
}

export type TranscriptLine = { t: string; text: string; isHook: boolean };
export type Beat = { name: string; timecode: string; analysis: string };
export type DeepAnalysisResult = { transcript: TranscriptLine[]; beats: Beat[]; hookTags: string[] };

// The hook window used to highlight early transcript lines in the UI.
const HOOK_WINDOW_SECONDS = 3;

async function downloadToTemp(url: string, ext: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download the video (${res.status}).`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(tmpdir(), `outlier-${randomUUID()}${ext}`);
  await writeFile(filePath, buffer);
  return filePath;
}

async function extractAudio(videoPath: string): Promise<string> {
  const audioPath = videoPath.replace(/\.[^.]+$/, "") + ".mp3";
  // Mono 16kHz is Whisper's native input rate — no benefit to sending more.
  await run(ffmpegPath.path, ["-i", videoPath, "-vn", "-ar", "16000", "-ac", "1", "-b:a", "64k", "-y", audioPath]);
  return audioPath;
}

async function transcribeAudio(audioPath: string, groqKey: string): Promise<{ start: number; text: string }[]> {
  const buffer = await readFile(audioPath);
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: "audio/mpeg" }), "audio.mp3");
  form.append("model", "whisper-large-v3");
  form.append("response_format", "verbose_json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${groqKey}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Transcription failed (${res.status}): ${text.slice(0, 300) || res.statusText}`);
  }
  const data = await res.json();
  const segments = (data.segments ?? []) as { start: number; text: string }[];
  return segments.map((s) => ({ start: s.start, text: s.text.trim() })).filter((s) => s.text.length > 0);
}

function formatTimecode(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function analyzeStructure(
  segments: { start: number; text: string }[],
  caption: string,
  durationSeconds: number,
  anthropicKey?: string | null
): Promise<{ beats: Beat[]; hookTags: string[] }> {
  const client = getAnthropicClient(anthropicKey);
  const transcriptText =
    segments.map((s) => `[${formatTimecode(s.start)}] ${s.text}`).join("\n") || "(no speech detected)";

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1500,
    system:
      "You are Outlier, an analyst of short-form video structure. Given a transcript and caption, break the video " +
      "into its narrative beats (name each one for what it actually does — Hook, Setup, Payoff, CTA, etc. — don't " +
      "force a fixed template) with timecodes, and name the hook's rhetorical style with 2-4 short tags. Be specific " +
      "and grounded only in the transcript provided — never invent visual detail you can't see from text alone.",
    tools: [
      {
        name: "submit_structure_analysis",
        description: "Submit the completed structure analysis.",
        input_schema: {
          type: "object",
          properties: {
            beats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Short beat name, e.g. HOOK, SETUP, PAYOFF, CTA." },
                  timecode: { type: "string", description: "e.g. '0:00-0:03'" },
                  analysis: { type: "string", description: "1-2 sentences, grounded in the transcript." },
                },
                required: ["name", "timecode", "analysis"],
              },
            },
            hookTags: {
              type: "array",
              items: { type: "string" },
              description:
                "2-4 short style tags for the hook, e.g. 'negative command', 'pattern interrupt', 'direct address'.",
            },
          },
          required: ["beats", "hookTags"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_structure_analysis" },
    messages: [
      {
        role: "user",
        content: `Caption: ${caption || "(none)"}\nDuration: ${durationSeconds.toFixed(1)}s\n\nTranscript:\n${transcriptText}`,
      },
    ],
  });

  const toolUse = message.content.find((b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return a structured analysis.");
  return toolUse.input as { beats: Beat[]; hookTags: string[] };
}

// Downloads the post's video (Apify already resolved the CDN URL — no
// yt-dlp needed), extracts audio, transcribes it via Groq's Whisper API,
// then asks Claude to identify narrative beats and hook style from the
// transcript alone (text, not vision — much cheaper, and the beats/hooks
// this UI shows are inherently about verbal structure).
export async function analyzePost({
  videoUrl,
  caption,
  durationSeconds,
  groqKey,
  anthropicKey,
}: {
  videoUrl: string;
  caption: string;
  durationSeconds: number;
  groqKey?: string | null;
  anthropicKey?: string | null;
}): Promise<DeepAnalysisResult> {
  const groq = getGroqKey(groqKey);
  let videoPath: string | null = null;
  let audioPath: string | null = null;

  try {
    videoPath = await downloadToTemp(videoUrl, ".mp4");
    audioPath = await extractAudio(videoPath);
    const segments = await transcribeAudio(audioPath, groq);

    const transcript: TranscriptLine[] = segments.map((s) => ({
      t: formatTimecode(s.start),
      text: s.text,
      isHook: s.start <= HOOK_WINDOW_SECONDS,
    }));

    const { beats, hookTags } = await analyzeStructure(segments, caption, durationSeconds, anthropicKey);

    return { transcript, beats, hookTags };
  } finally {
    if (videoPath) await rm(videoPath, { force: true });
    if (audioPath) await rm(audioPath, { force: true });
  }
}
