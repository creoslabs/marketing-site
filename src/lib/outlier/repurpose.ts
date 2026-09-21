import Anthropic from "@anthropic-ai/sdk";
import type { TranscriptLine, Beat } from "@/app/outlier/data";

function getAnthropicClient(overrideKey?: string | null) {
  const apiKey = overrideKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No Anthropic API key available — set one on the Account tab (Testing -> API Keys) or add ANTHROPIC_API_KEY to .env.local."
    );
  }
  return new Anthropic({ apiKey });
}

export type RepurposedScript = { title: string; hook: string; beats: { name: string; script: string }[] };

// Turns a proven outlier post's structure — its hook style and beat
// sequence, both already extracted by the analysis pipeline — into an
// ORIGINAL script for the user's own content. The model is explicitly told
// to borrow the pattern, never the specifics: this is structural learning,
// not paraphrasing someone else's video.
export async function generateRepurpose({
  transcript,
  beats,
  hookTags,
  caption,
  topic,
  anthropicKey,
}: {
  transcript: TranscriptLine[];
  beats: Beat[];
  hookTags: string[];
  caption: string;
  topic: string;
  anthropicKey?: string | null;
}): Promise<RepurposedScript> {
  const client = getAnthropicClient(anthropicKey);

  const transcriptText = transcript.map((line) => `[${line.t}] ${line.text}`).join("\n") || "(no transcript)";
  const beatsText =
    beats.map((b) => `${b.name} (${b.timecode}): ${b.analysis}`).join("\n") || "(no beat breakdown)";

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1500,
    system:
      "You are Outlier's repurpose assistant. The user tracks other creators' outlier posts to learn from what performs " +
      "well. You'll be given the transcript, hook style tags, and beat-by-beat structure of one proven post, plus a " +
      "short description of the user's own content or niche. Write an ORIGINAL script for a NEW video in the user's " +
      "niche that borrows the proven structural pattern — the same beat sequence, the same class of hook — but is " +
      "entirely new content. Never reuse the source's specific wording, claims, product names, or story details: " +
      "this is learning from structure, not paraphrasing. Write real, usable script lines for each beat, not a " +
      "description of what the beat should do.",
    tools: [
      {
        name: "submit_repurposed_script",
        description: "Submit the completed repurposed script.",
        input_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "A short, punchy working title for this new video idea." },
            hook: {
              type: "string",
              description: "The opening line(s) for the new video, in the same rhetorical style as the source hook.",
            },
            beats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Beat name, matching the source's beat structure." },
                  script: { type: "string", description: "Actual script lines for this beat — 1-3 sentences." },
                },
                required: ["name", "script"],
              },
            },
          },
          required: ["title", "hook", "beats"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_repurposed_script" },
    messages: [
      {
        role: "user",
        content:
          `Source caption: ${caption || "(none)"}\n` +
          `Source hook style: ${hookTags.join(", ") || "(none)"}\n\n` +
          `Source beats:\n${beatsText}\n\n` +
          `Source transcript:\n${transcriptText}\n\n` +
          `My content/niche: ${topic}`,
      },
    ],
  });

  const toolUse = message.content.find((b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return a repurposed script.");
  return toolUse.input as RepurposedScript;
}
