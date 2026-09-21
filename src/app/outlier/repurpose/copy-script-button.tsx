"use client";

import { useState } from "react";
import type { RepurposeBeat } from "../data";

export function CopyScriptButton({ hook, beats }: { hook: string; beats: RepurposeBeat[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [hook, ...beats.map((b) => `\n${b.name.toUpperCase()}\n${b.script}`)].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ws-btn-ghost rounded-[8px] text-[12.5px] font-semibold"
      style={{ padding: "9px 14px" }}
    >
      {copied ? "Copied ✓" : "Copy script"}
    </button>
  );
}
