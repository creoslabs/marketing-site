"use client";

import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { VIDEO_ASSET, STATIC_ASSET } from "../data";

type Stage = "idle" | "analyzing" | "done";

export function AnalyzeDropzone() {
  const [dragOver, setDragOver] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [detectedFormat, setDetectedFormat] = useState<"video" | "static" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const format = file.type.startsWith("video/") ? "video" : "static";
    setDetectedFormat(format);
    setStage("analyzing");
    setTimeout(() => setStage("done"), 1400);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  const reportId = detectedFormat === "video" ? VIDEO_ASSET.id : STATIC_ASSET.id;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="mx-auto flex max-w-[520px] flex-col items-center rounded-[12px] text-center"
      style={{
        padding: "60px 32px",
        border: `1.5px dashed ${dragOver ? "var(--ws-accent)" : "color-mix(in srgb, var(--ws-accent) 50%, transparent)"}`,
        background: dragOver ? "var(--ws-accent-tint)" : "var(--ws-surface)",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {stage === "idle" && (
        <>
          <div
            className="flex h-[56px] w-[56px] items-center justify-center rounded-[14px]"
            style={{ background: "var(--ws-accent-tint)", color: "var(--ws-accent-text)", fontSize: 24 }}
          >
            ↑
          </div>
          <p className="mt-[18px] text-[16px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            Drop an asset to analyze
          </p>
          <p className="mt-[6px] text-[12.5px]" style={{ color: "var(--ws-ink-45)" }}>
            Static or video · up to 500 MB
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="ws-btn-primary mt-[20px] rounded-[8px] text-[12.5px] font-semibold"
            style={{ padding: "10px 16px" }}
          >
            Choose a file
          </button>
        </>
      )}

      {stage === "analyzing" && (
        <>
          <p className="ws-eyebrow">ANALYZING</p>
          <p className="mt-[10px] text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            Detecting format and running the criteria set…
          </p>
          <div
            className="mt-[16px] h-[4px] w-full overflow-hidden rounded-[3px]"
            style={{ background: "var(--ws-hairline)" }}
          >
            <div
              className="h-full rounded-[3px]"
              style={{ width: "70%", background: "var(--ws-accent)", animation: "ws-badge-pulse 0.8s ease-in-out infinite" }}
            />
          </div>
        </>
      )}

      {stage === "done" && (
        <>
          <p className="ws-eyebrow" style={{ color: "var(--ws-accent-text)" }}>
            ANALYSIS COMPLETE
          </p>
          <p className="mt-[10px] text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            Format detected: <span style={{ color: "var(--ws-ink)", fontWeight: 600 }}>{detectedFormat}</span>
          </p>
          <Link
            href={`/signal/report/${reportId}`}
            className="ws-btn-primary mt-[16px] rounded-[8px] text-[12.5px] font-semibold"
            style={{ padding: "10px 16px" }}
          >
            View report →
          </Link>
        </>
      )}
    </div>
  );
}
