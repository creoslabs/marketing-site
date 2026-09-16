"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stage = "idle" | "uploading" | "analyzing" | "error";

export function AnalyzeDropzone() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const format = file.type.startsWith("video/") ? "video" : "static";
    setError("");
    setStage("uploading");

    try {
      const urlRes = await fetch("/api/signal/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      const urlData = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlData.error ?? "Could not start the upload.");

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("signal-assets")
        .uploadToSignedUrl(urlData.path, urlData.token, file);
      if (uploadError) throw uploadError;

      setStage("analyzing");
      const analyzeRes = await fetch("/api/signal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: urlData.path, filename: file.name, format }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error ?? "Analysis failed.");

      router.push(`/signal/report/${analyzeData.assetId}`);
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

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

      {(stage === "uploading" || stage === "analyzing") && (
        <>
          <p className="ws-eyebrow">{stage === "uploading" ? "UPLOADING" : "ANALYZING"}</p>
          <p className="mt-[10px] text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            {stage === "uploading"
              ? "Sending the asset to storage…"
              : "Detecting format and running the criteria set — this can take a minute for video."}
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

      {stage === "error" && (
        <>
          <p className="ws-eyebrow" style={{ color: "var(--ws-warn-text)" }}>
            COULDN&apos;T ANALYZE THAT ASSET
          </p>
          <p className="mt-[10px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => setStage("idle")}
            className="ws-btn-ghost mt-[16px] rounded-[8px] text-[12.5px] font-medium"
            style={{ padding: "9px 14px" }}
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}
