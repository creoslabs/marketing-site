import Anthropic from "@anthropic-ai/sdk";
import type { Criterion, StaticFinding, VideoFinding } from "@/app/signal/data";

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

// Safe-zone overlap, cut pacing, and every "does X happen in the hook
// window" criterion (motion/face/text detected, message clarity, audio
// onset) are judged separately from raw measurements (see
// safeZoneMeasurementSchema / hookMeasurementsSchema below) — their
// pass/partial/fail depends on which platform(s) the asset targets, which
// TikTok and Meta define differently. Claude reports the underlying
// measurement once; lib/signal/criteria.ts turns it into a verdict per
// platform.
const VIDEO_JUDGED_CRITERIA = [
  "On-screen text coverage",
  "Product first appearance",
  "Product visible duration",
  "Native feel vs polished ad",
  "Text legibility & hold time",
  "Sound-off redundancy",
] as const;

const VIDEO_TIER: Record<string, 1 | 2> = {
  "On-screen text coverage": 1,
  "Product first appearance": 2,
  "Product visible duration": 2,
  "Native feel vs polished ad": 2,
  "Text legibility & hold time": 2,
  "Sound-off redundancy": 2,
  // Measurement-based criteria (see criteria.ts) — kept here too so findings
  // referencing them (VIDEO_FINDING_CRITERIA below) get the right tier badge.
  "Cut frequency vs platform pacing": 1,
  "Hook window motion detected": 1,
  "Hook window face detected": 1,
  "Hook window text on screen": 1,
  "Hook window audio onset": 1,
  "Message clarity in hook window": 2,
  "Safe-zone overlap across full runtime": 1,
};

// Findings can still narrate the measurement-based criteria (e.g. "face
// doesn't appear until 0:06") even though their pass/fail is computed from
// the raw measurement, not judged directly — the narrative value doesn't
// depend on who computes the verdict.
const VIDEO_FINDING_CRITERIA = [
  ...VIDEO_JUDGED_CRITERIA,
  "Cut frequency vs platform pacing",
  "Hook window motion detected",
  "Hook window face detected",
  "Hook window text on screen",
  "Hook window audio onset",
  "Message clarity in hook window",
  "Safe-zone overlap across full runtime",
] as const;

// Safe-zone overlap is judged separately (see safeZoneMeasurementSchema
// below) — see the comment on VIDEO_JUDGED_CRITERIA above.
const STATIC_JUDGED_CRITERIA = [
  "On-screen text legibility",
  "Product framing & legibility",
  "Scroll-stopping composition",
  "Message clarity at a glance",
] as const;

const STATIC_TIER: Record<string, 1 | 2> = {
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

const safeZoneMeasurementSchema = {
  type: "object" as const,
  properties: {
    maxTopIntrusionPct: {
      type: "number",
      description:
        "Deepest measured intrusion of key content (text/logo/product) into the top margin, as a percentage (0-100) of frame height, at its worst point.",
    },
    maxBottomIntrusionPct: {
      type: "number",
      description: "Same, for the bottom margin.",
    },
  },
  required: ["maxTopIntrusionPct", "maxBottomIntrusionPct"],
};

type SafeZoneMeasurement = { maxTopIntrusionPct: number; maxBottomIntrusionPct: number };

const hookMeasurementsSchema = {
  type: "object" as const,
  properties: {
    avgSecondsPerCut: {
      type: "number",
      description: "Average seconds between cuts/scene changes across the full runtime — an editing-pace measurement, not a verdict.",
    },
    motionTimestampSeconds: {
      type: ["number", "null"],
      description: "Timestamp (seconds) of the first clearly visible motion or action, or null if the video is static/no motion.",
    },
    faceTimestampSeconds: {
      type: ["number", "null"],
      description: "Timestamp of the first clearly visible human face, or null if no face ever appears.",
    },
    textOnScreenTimestampSeconds: {
      type: ["number", "null"],
      description: "Timestamp of the first on-screen text or caption, or null if none appears.",
    },
    messageClarityTimestampSeconds: {
      type: ["number", "null"],
      description: "Timestamp at which the core message or value proposition first becomes clear to a viewer, or null if it never does.",
    },
  },
  required: ["avgSecondsPerCut", "motionTimestampSeconds", "faceTimestampSeconds", "textOnScreenTimestampSeconds", "messageClarityTimestampSeconds"],
};

type HookMeasurements = {
  avgSecondsPerCut: number;
  motionTimestampSeconds: number | null;
  faceTimestampSeconds: number | null;
  textOnScreenTimestampSeconds: number | null;
  messageClarityTimestampSeconds: number | null;
};

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
}): Promise<{
  criteria: Criterion[];
  findings: VideoFinding[];
  topFix: TopFixResult;
  safeZoneMeasurement: SafeZoneMeasurement;
  hookMeasurements: HookMeasurements;
}> {
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
      "Platform UI chrome overlays the top and bottom margins of the frame, and how tight the 'hook window' and " +
      "cut pacing should be, all vary by platform (TikTok vs Meta) — instead of judging those yourself, measure " +
      "and report: how deep into the top/bottom margins key content (text/logo/product) reaches across the full " +
      "runtime; the average seconds between cuts; and the timestamp each hook element (motion, a face, on-screen " +
      "text, message clarity) first appears. The app converts these measurements into verdicts per platform. " +
      "Never invent a criterion outside the fixed list.",
    tools: [
      {
        name: "submit_video_analysis",
        description: "Submit the completed video ad analysis.",
        input_schema: {
          type: "object",
          properties: {
            criteria: { type: "array", items: criterionSchema(VIDEO_JUDGED_CRITERIA), minItems: VIDEO_JUDGED_CRITERIA.length },
            safeZoneMeasurement: safeZoneMeasurementSchema,
            hookMeasurements: hookMeasurementsSchema,
            findings: {
              type: "array",
              description: "5-8 timestamped observations worth surfacing, each tied to one of the provided frame timestamps.",
              items: {
                type: "object",
                properties: {
                  t: { type: "integer", description: "Must exactly match one of the provided frame timestamps." },
                  criterion: { type: "string", enum: VIDEO_FINDING_CRITERIA as unknown as string[] },
                  failure: { type: "boolean" },
                  body: { type: "string", description: "One sentence, specific and falsifiable." },
                },
                required: ["t", "criterion", "failure", "body"],
              },
            },
            topFix: topFixSchema,
          },
          required: ["criteria", "safeZoneMeasurement", "hookMeasurements", "findings", "topFix"],
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
    safeZoneMeasurement: SafeZoneMeasurement;
    hookMeasurements: HookMeasurements;
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

  return {
    criteria,
    findings,
    topFix: result.topFix,
    safeZoneMeasurement: result.safeZoneMeasurement,
    hookMeasurements: result.hookMeasurements,
  };
}

export async function judgeStaticCriteria({
  imageDataUrl,
  apiKey,
}: {
  imageDataUrl: string;
  apiKey?: string | null;
}): Promise<{ criteria: Criterion[]; findings: StaticFinding[]; topFix: TopFixResult; safeZoneMeasurement: SafeZoneMeasurement }> {
  const client = getClient(apiKey);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "You are Signal, an ad-creative analyst. Score a static (4:5) ad image against a fixed best-practice criteria " +
      "set using only what is visible in the image. Be direct and specific — every evidence string must be something " +
      "you could point to, never a vague impression. Platform UI chrome overlays the top and bottom margins, but " +
      "exactly how much varies by platform (TikTok vs Meta) — instead of judging safe-zone pass/fail yourself, " +
      "measure and report how deep into the top and bottom margins key content (text/logo/product) actually " +
      "reaches; the app converts that measurement into a verdict per platform. Never invent a criterion outside the fixed list.",
    tools: [
      {
        name: "submit_static_analysis",
        description: "Submit the completed static ad analysis.",
        input_schema: {
          type: "object",
          properties: {
            criteria: { type: "array", items: criterionSchema(STATIC_JUDGED_CRITERIA), minItems: STATIC_JUDGED_CRITERIA.length },
            safeZoneMeasurement: safeZoneMeasurementSchema,
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
          required: ["criteria", "safeZoneMeasurement", "findings", "topFix"],
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
    safeZoneMeasurement: SafeZoneMeasurement;
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

  return { criteria, findings, topFix: result.topFix, safeZoneMeasurement: result.safeZoneMeasurement };
}
