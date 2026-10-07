"use client";

import { useState } from "react";
import type { RepurposeBeat } from "../data";
import { Button } from "@/components/app/ui";

export function CopyScriptButton({ hook, beats }: { hook: string; beats: RepurposeBeat[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [hook, ...beats.map((b) => `\n${b.name.toUpperCase()}\n${b.script}`)].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button variant="ghost" onClick={handleCopy}>
      {copied ? "Copied ✓" : "Copy script"}
    </Button>
  );
}
