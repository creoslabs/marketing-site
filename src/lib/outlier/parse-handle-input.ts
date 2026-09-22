import type { Platform } from "@/app/outlier/data";

const URL_PATTERNS: { platform: Platform; regex: RegExp }[] = [
  { platform: "TT", regex: /tiktok\.com\/@([a-zA-Z0-9._]+)/i },
  { platform: "IG", regex: /instagram\.com\/([a-zA-Z0-9._]+)/i },
  { platform: "YT", regex: /youtube\.com\/@([a-zA-Z0-9._-]+)/i },
];

// Lets someone paste a full profile URL instead of hunting for the bare
// handle and remembering which platform dropdown to pick — returns the
// detected platform only when the input actually looks like one of these
// three sites' profile URLs; anything else (a bare handle, a typo, some
// other site) is left for the caller to treat as free-typed input.
export function parseHandleInput(input: string): { platform: Platform; handle: string } | { platform: null; handle: string } {
  const trimmed = input.trim();
  for (const { platform, regex } of URL_PATTERNS) {
    const match = trimmed.match(regex);
    if (match) return { platform, handle: match[1] };
  }
  return { platform: null, handle: trimmed };
}
