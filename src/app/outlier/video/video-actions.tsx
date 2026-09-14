"use client";

import { useState } from "react";

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
  return (
    <button
      type="button"
      onClick={() => alert("Opening the original post isn't available yet.")}
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
  return (
    <button
      type="button"
      onClick={() => alert("Repurpose isn't built yet — coming next.")}
      className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
      style={{ padding: "10px 14px" }}
    >
      Repurpose →
    </button>
  );
}
