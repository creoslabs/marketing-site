"use client";

import { useState } from "react";
import { useToast } from "@/components/ws-toast";
import { Button } from "@/components/app/ui";

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
    <>
      {isPublic && (
        <Button variant="ghost" onClick={copyLink}>
          {copied ? "Copied ✓" : "Copy public link"}
        </Button>
      )}
      <Button variant={isPublic ? "paper" : "ghost"} onClick={toggle} disabled={pending}>
        {isPublic ? "Public ✓" : "Make public"}
      </Button>
    </>
  );
}
