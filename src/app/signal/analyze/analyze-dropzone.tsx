"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type QueueItem = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "analyzing" | "done" | "error";
  assetId?: string;
  error?: string;
};

async function analyzeOne(file: File): Promise<{ assetId: string }> {
  const format = file.type.startsWith("video/") ? "video" : "static";

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

  const analyzeRes = await fetch("/api/signal/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: urlData.path, filename: file.name, format }),
  });
  const analyzeData = await analyzeRes.json();
  if (!analyzeRes.ok) throw new Error(analyzeData.error ?? "Analysis failed.");

  return { assetId: analyzeData.assetId };
}

export function AnalyzeDropzone() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const idle = queue.length === 0;
  const finished = queue.length > 0 && !running && queue.every((q) => q.status === "done" || q.status === "error");

  async function handleFiles(files: FileList | File[] | null) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;

    // A single file keeps the old behavior: go straight to its report once
    // it's done. Multiple files stay on this page as a visible queue —
    // jumping straight to the last one processed would hide the others.
    const items: QueueItem[] = list.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      status: "queued",
    }));
    setQueue(items);
    setRunning(true);

    let lastAssetId: string | null = null;
    for (const item of items) {
      setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q)));
      try {
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "analyzing" } : q)));
        const { assetId } = await analyzeOne(item.file);
        lastAssetId = assetId;
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "done", assetId } : q)));
      } catch (err) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error", error: err instanceof Error ? err.message : "Something went wrong." }
              : q
          )
        );
      }
    }
    setRunning(false);

    if (items.length === 1 && lastAssetId) {
      router.push(`/signal/report/${lastAssetId}`);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function reset() {
    setQueue([]);
  }

  return (
    <div className="mx-auto max-w-[520px]">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="flex flex-col items-center rounded-[12px] text-center"
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
          multiple
          accept="video/*,image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {idle && (
          <>
            <div
              className="flex h-[56px] w-[56px] items-center justify-center rounded-[14px]"
              style={{ background: "var(--ws-accent-tint)", color: "var(--ws-accent-text)", fontSize: 24 }}
            >
              ↑
            </div>
            <p className="mt-[18px] text-[16px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Drop assets to analyze
            </p>
            <p className="mt-[6px] text-[12.5px]" style={{ color: "var(--ws-ink-45)" }}>
              Static or video, one or many · up to 500 MB each
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ws-btn-primary mt-[20px] rounded-[8px] text-[12.5px] font-semibold"
              style={{ padding: "10px 16px" }}
            >
              Choose files
            </button>
          </>
        )}

        {!idle && (
          <>
            <p className="ws-eyebrow">
              {running ? "PROCESSING" : "DONE"} · {queue.filter((q) => q.status === "done" || q.status === "error").length}/
              {queue.length}
            </p>
            <p className="mt-[10px] text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
              {running
                ? "Uploading and running the criteria set — video can take a minute each."
                : "All files processed."}
            </p>
            <div className="mt-[16px] h-[4px] w-full overflow-hidden rounded-[3px]" style={{ background: "var(--ws-hairline)" }}>
              <div
                className="h-full rounded-[3px]"
                style={{
                  width: `${(queue.filter((q) => q.status === "done" || q.status === "error").length / queue.length) * 100}%`,
                  background: "var(--ws-accent)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          </>
        )}
      </div>

      {queue.length > 1 && (
        <div className="ws-stack mt-[18px]">
          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-[10px]" style={{ padding: "11px 14px" }}>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                {item.file.name}
              </span>
              {item.status === "done" && item.assetId ? (
                <Link href={`/signal/report/${item.assetId}`} className="ws-link-accent shrink-0 text-[11.5px] font-medium">
                  View report →
                </Link>
              ) : item.status === "error" ? (
                <span className="shrink-0 text-[11.5px]" style={{ color: "var(--ws-warn-text)" }} title={item.error}>
                  Failed
                </span>
              ) : (
                <span className="shrink-0 text-[11.5px] capitalize" style={{ color: "var(--ws-ink-45)" }}>
                  {item.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {finished && queue.length > 1 && (
        <div className="mt-[16px] flex justify-center gap-[8px]">
          <button type="button" onClick={reset} className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium" style={{ padding: "9px 14px" }}>
            Analyze more
          </button>
          <Link href="/signal" className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "9px 14px" }}>
            Go to Library
          </Link>
        </div>
      )}
    </div>
  );
}
