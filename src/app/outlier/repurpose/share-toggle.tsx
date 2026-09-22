"use client";

import { useState } from "react";
import { useToast } from "@/components/ws-toast";

export function ShareToggle({ repurposeId, initialPublic }: { repurposeId: string; initialPublic: boolean }) {
  const toast = useToast();
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function toggle() {
    setPending(true);
    const next = !isPublic;
    const res = await fetch(`/api/outlier/repurposes/${repurposeId}/share`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: next }),
    });
    setPending(false);
    if (res.ok) {
      setIsPublic(next);
      toast(next ? "Anyone with the link can now view this." : "Link disabled — no longer viewable.", "success");
    } else {
      toast("Couldn't update sharing.", "error");
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/share/repurpose/${repurposeId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex items-center gap-[8px]">
      {isPublic && (
        <button
          type="button"
          onClick={copyLink}
          className="ws-btn-ghost rounded-[8px] text-[12.5px] font-semibold"
          style={{ padding: "9px 14px" }}
        >
          {copied ? "Copied ✓" : "Copy public link"}
        </button>
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="rounded-[8px] text-[12.5px] font-semibold"
        style={
          isPublic
            ? {
                padding: "9px 14px",
                background: "var(--ws-accent-tint)",
                border: "1px solid var(--ws-accent-tint-border)",
                color: "var(--ws-accent-tint-ink)",
                opacity: pending ? 0.6 : 1,
              }
            : { padding: "9px 14px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-60)", opacity: pending ? 0.6 : 1 }
        }
      >
        {isPublic ? "Public ✓" : "Make public"}
      </button>
    </div>
  );
}
