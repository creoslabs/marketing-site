"use client";

import { useState } from "react";
import { useToast } from "@/components/ws-toast";

export function FavouriteButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setSaved((v) => !v)}
      className="flex-1 rounded-[8px] text-[12.5px] font-medium"
      style={
        saved
          ? {
              padding: "9px 10px",
              background: "var(--ws-accent-tint)",
              border: "1px solid var(--ws-accent-tint-border)",
              color: "var(--ws-accent-tint-ink)",
            }
          : {
              padding: "9px 10px",
              background: "transparent",
              border: "1px solid var(--ws-hairline)",
              color: "var(--ws-ink-60)",
            }
      }
    >
      {saved ? "★ Saved" : "☆ Favourite"}
    </button>
  );
}

export function OpenOnPlatformButton({ label }: { label: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast("Opening the original post isn't available yet.")}
      className="flex-1 rounded-[8px] text-[12.5px] font-medium"
      style={{
        padding: "9px 10px",
        background: "transparent",
        border: "1px solid var(--ws-hairline)",
        color: "var(--ws-ink-60)",
      }}
    >
      {label} ↗
    </button>
  );
}

export function RepurposeButton() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast("Repurpose isn't built yet — coming next.")}
      className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
      style={{ padding: "10px 14px" }}
    >
      Repurpose →
    </button>
  );
}
