import Anthropic from "@anthropic-ai/sdk";
import type { Criterion, StaticFinding, VideoFinding } from "@/app/signal/data";
import { HOOK_WINDOW_SECONDS } from "./criteria";

// A per-user key set on the Account tab (Testing -> API Keys) takes
// priority over the server's own ANTHROPIC_API_KEY, so testing doesn't
// require touching env vars / redeploying.
function getClient(overrideApiKey?: string | null) {
  const apiKey = overrideApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No Anthropic API key available — set one on the Account tab (Testing -> API Keys) or add ANTHROPIC_API_KEY to .env.local."
    );
  }
  return new Anthropic({ apiKey });
}

const MODEL = "claude-sonnet-5";

const VIDEO_JUDGED_CRITERIA = [
  "Safe-zone overlap across full runtime",
  "Cut frequency vs platform pacing",
  "Hook window motion detected",
  "Hook window face detected",
  "Hook window text on screen",
  "On-screen text coverage",
  "Product first appearance",
  "Product visible duration",
  "Message clarity in hook window",
  "Native feel vs polished ad",
  "Text legibility & hold time",
  "Sound-off redundancy",
] as const;

const VIDEO_TIER: Record<string, 1 | 2> = {
  "Safe-zone overlap across full runtime": 1,
  "Cut frequency vs platform pacing": 1,
  "Hook window motion detected": 1,
  "Hook window face detected": 1,
  "Hook window text on screen": 1,
  "On-screen text coverage": 1,
  "Product first appearance": 2,
  "Product visible duration": 2,
  "Message clarity in hook window": 2,
  "Native feel vs polished ad": 2,
  "Text legibility & hold time": 2,
  "Sound-off redundancy": 2,
};

const STATIC_JUDGED_CRITERIA = [
  "Safe-zone overlap",
  "On-screen text legibility",
  "Product framing & legibility",
  "Scroll-stopping composition",
  "Message clarity at a glance",
] as const;

const STATIC_TIER: Record<string, 1 | 2> = {
  "Safe-zone overlap": 1,
  "On-screen text legibility": 1,
  "Product framing & legibility": 2,
  "Scroll-stopping composition": 2,
  "Message clarity at a glance": 2,
};

type TopFixResult = { title: string; body: string; addressesCriteria: string[] };

const criterionSchema = (names: readonly string[]) => ({
  type: "object" as const,
  properties: {
    name: { type: "string", enum: names as unknown as string[] },
    verdict: { type: "string", enum: ["pass", "partial", "fail"] },
    evidence: {
      type: "string",
      description: "Short, specific, falsifiable evidence — a timestamp, percentage, or count. Never a bare verdict.",
    },
  },
  required: ["name", "verdict", "evidence"],
});

const topFixSchema = {
  type: "object" as const,
  properties: {
    title: { type: "string", description: "The single highest-leverage fix, as an imperative sentence." },
    body: { type: "string", description: "1-2 sentences explaining why this fix matters." },
    addressesCriteria: {
      type: "array",
      items: { type: "string" },
      description: "Names of criteria this fix would flip from fail/partial to pass.",
    },
  },
  required: ["title", "body", "addressesCriteria"],
};

export async function judgeVideoCriteria({
  frames,
  durationSeconds,
  audioOnsetSeconds,
  apiKey,
}: {
  frames: { t: number; buffer: Buffer }[];
  durationSeconds: number;
  audioOnsetSeconds: number | null;
  apiKey?: string | null;
}): Promise<{ criteria: Criterion[]; findings: VideoFinding[]; topFix: TopFixResult }> {
  const client = getClient(apiKey);

  const frameContent: Anthropic.Messages.ContentBlockParam[] = frames.flatMap((frame) => [
    { type: "text" as const, text: `Frame at 0:${String(frame.t).padStart(2, "0")}:` },
    {
      type: "image" as const,
      source: { type: "base64" as const, media_type: "image/jpeg" as const, data: frame.buffer.toString("base64") },
    },
  ]);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "You are Signal, an ad-creative analyst. Score a short-form vertical video ad against a fixed best-practice " +
      "criteria set using only what is visible in the sampled frames and the metadata provided. Be direct and " +
      "specific — every evidence string must be something you could point to, never a vague impression. " +
      "The 'hook window' is the first " +
      HOOK_WINDOW_SECONDS +
      " seconds. The safe zone excludes the top ~15% and bottom ~20% of the frame (platform UI overlays that region). " +
      "Never invent a criterion outside the fixed list.",
    tools: [
      {
        name: "submit_video_analysis",
        description: "Submit the completed video ad analysis.",
        input_schema: {
          type: "object",
          properties: {
            criteria: { type: "array", items: criterionSchema(VIDEO_JUDGED_CRITERIA), minItems: VIDEO_JUDGED_CRITERIA.length },
            findings: {
              type: "array",
              description: "5-8 timestamped observations worth surfacing, each tied to one of the provided frame timestamps.",
              items: {
                type: "object",
                properties: {
                  t: { type: "integer", description: "Must exactly match one of the provided frame timestamps." },
                  criterion: { type: "string", enum: VIDEO_JUDGED_CRITERIA as unknown as string[] },
                  failure: { type: "boolean" },
                  body: { type: "string", description: "One sentence, specific and falsifiable." },
                },
                required: ["t", "criterion", "failure", "body"],
              },
            },
            topFix: topFixSchema,
          },
          required: ["criteria", "findings", "topFix"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_video_analysis" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Video duration: ${durationSeconds.toFixed(1)}s. Audio onset: ${
              audioOnsetSeconds === null ? "no audio track" : `0:${String(Math.round(audioOnsetSeconds)).padStart(2, "0")}`
            }. Sampled frames follow, in order:`,
          },
          ...frameContent,
        ],
      },
    ],
  });

  const toolUse = message.content.find((block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return a structured analysis.");

  const result = toolUse.input as {
    criteria: { name: string; verdict: Criterion["verdict"]; evidence: string }[];
    findings: { t: number; criterion: string; failure: boolean; body: string }[];
    topFix: TopFixResult;
  };

  const criteria: Criterion[] = result.criteria.map((c) => ({
    name: c.name,
    tier: VIDEO_TIER[c.name] ?? 2,
    evidence: c.evidence,
    verdict: c.verdict,
  }));

  const findings: VideoFinding[] = result.findings.map((f, i) => ({
    id: `f-${i}`,
    t: f.t,
    criterion: f.criterion,
    tier: VIDEO_TIER[f.criterion] ?? 2,
    failure: f.failure,
    body: f.body,
  }));

  return { criteria, findings, topFix: result.topFix };
}

export async function judgeStaticCriteria({
  imageDataUrl,
  apiKey,
}: {
  imageDataUrl: string;
  apiKey?: string | null;
}): Promise<{ criteria: Criterion[]; findings: StaticFinding[]; topFix: TopFixResult }> {
  const client = getClient(apiKey);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "You are Signal, an ad-creative analyst. Score a static (4:5) ad image against a fixed best-practice criteria " +
      "set using only what is visible in the image. Be direct and specific — every evidence string must be something " +
      "you could point to, never a vague impression. The safe zone excludes the top ~14% and bottom ~21% of the " +
      "frame (platform UI overlays that region). Never invent a criterion outside the fixed list.",
    tools: [
      {
        name: "submit_static_analysis",
        description: "Submit the completed static ad analysis.",
        input_schema: {
          type: "object",
          properties: {
            criteria: { type: "array", items: criterionSchema(STATIC_JUDGED_CRITERIA), minItems: STATIC_JUDGED_CRITERIA.length },
            findings: {
              type: "array",
              description: "2-4 spatial observations, each anchored to a region of the image as percentages (0-100).",
              items: {
                type: "object",
                properties: {
                  marker: { type: "string", enum: ["A", "B", "check"], description: "'check' for a positive finding worth keeping." },
                  criterion: { type: "string", enum: STATIC_JUDGED_CRITERIA as unknown as string[] },
                  body: { type: "string" },
                  region: {
                    type: "object",
                    properties: {
                      top: { type: "number" },
                      left: { type: "number" },
                      width: { type: "number" },
                      height: { type: "number" },
                    },
                    required: ["top", "left", "width", "height"],
                  },
                },
                required: ["marker", "criterion", "body", "region"],
              },
            },
            topFix: topFixSchema,
          },
          required: ["criteria", "findings", "topFix"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_static_analysis" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this static ad image:" },
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: imageDataUrl.split(",")[1] },
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find((block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return a structured analysis.");

  const result = toolUse.input as {
    criteria: { name: string; verdict: Criterion["verdict"]; evidence: string }[];
    findings: {
      marker: "A" | "B" | "check";
      criterion: string;
      body: string;
      region: { top: number; left: number; width: number; height: number };
    }[];
    topFix: TopFixResult;
  };

  const criteria: Criterion[] = result.criteria.map((c) => ({
    name: c.name,
    tier: STATIC_TIER[c.name] ?? 2,
    evidence: c.evidence,
    verdict: c.verdict,
  }));

  const findings: StaticFinding[] = result.findings.map((f, i) => ({
    id: `f-${i}`,
    marker: f.marker,
    criterion: f.criterion,
    tier: STATIC_TIER[f.criterion] ?? 2,
    body: f.body,
    region: f.region,
  }));

  return { criteria, findings, topFix: result.topFix };
}
