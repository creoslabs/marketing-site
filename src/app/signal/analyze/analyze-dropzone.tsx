"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Platform } from "../data";

const ALL_PLATFORMS: Platform[] = ["TikTok", "Meta"];

type QueueItem = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "analyzing" | "done" | "error";
  assetId?: string;
  error?: string;
  score?: number;
  counts?: { pass: number; partial: number; fail: number };
};

// The server does this work in one request with no granular progress
// signal, so these stages are a client-side heartbeat, not a real percentage
// — they cycle to show the pipeline is alive during the minute-plus a video
// can take, not to claim a specific completion fraction.
const VIDEO_STAGES = ["Extracting frames…", "Transcribing audio…", "Checking best practices…", "Scoring the hook window…"];
const STATIC_STAGES = ["Reading the frame…", "Checking best practices…", "Scoring composition…"];

function useCyclingStage(active: boolean, stages: string[], intervalMs = 2200) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setI((prev) => (prev + 1) % stages.length), intervalMs);
    return () => clearInterval(id);
  }, [active, stages, intervalMs]);
  return stages[i % stages.length];
}

function Spinner({ size = 13 }: { size?: number }) {
  return (
    <svg className="ws-spin shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--ws-hairline)" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--ws-accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function QueueRow({ item }: { item: QueueItem }) {
  const isVideo = item.file.type.startsWith("video/");
  const stage = useCyclingStage(item.status === "analyzing", isVideo ? VIDEO_STAGES : STATIC_STAGES);

  return (
    <div style={{ padding: "11px 14px" }}>
      <div className="flex items-center gap-[10px]">
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
          {item.file.name}
        </span>
        {item.status === "done" && item.assetId ? (
          <Link href={`/signal/report/${item.assetId}`} className="ws-link-accent shrink-0 text-[11.5px] font-medium">
            View report →
          </Link>
        ) : item.status === "error" ? (
          <span className="shrink-0 text-[11.5px] font-medium" style={{ color: "var(--ws-warn-text)" }}>
            Failed
          </span>
        ) : item.status === "analyzing" ? (
          <span className="inline-flex shrink-0 items-center gap-[6px] text-[11.5px]" style={{ color: "var(--ws-ink-60)" }}>
            <Spinner />
            {stage}
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-[6px] text-[11.5px] capitalize" style={{ color: "var(--ws-ink-45)" }}>
            {item.status === "uploading" && <Spinner />}
            {item.status}
          </span>
        )}
      </div>
      {item.status === "error" && item.error && (
        <p className="mt-[4px] text-[11.5px] leading-[1.4]" style={{ color: "var(--ws-warn-text)" }}>
          {item.error}
        </p>
      )}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: color, display: "inline-block" }} />;
}

type ScorecardSort = "score" | "order";

// A live, sortable leaderboard for a batch upload (2+ files) — replaces the
// plain queue list once there's more than one item, so scoring 3-5 variants
// stays one working session instead of upload → wait → view → repeat for
// each one individually. Rows still in progress just sink to the bottom
// (no score yet) until they land.
function Scorecard({
  items,
  sort,
  onSortChange,
}: {
  items: QueueItem[];
  sort: ScorecardSort;
  onSortChange: (sort: ScorecardSort) => void;
}) {
  const anyDone = items.some((i) => i.status === "done");
  const sorted =
    sort === "score"
      ? [...items].sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
      : items;

  return (
    <div className="mt-[18px]">
      <div className="flex items-center justify-between px-[2px]">
        <p className="ws-eyebrow">SCORECARD</p>
        {anyDone && (
          <div className="inline-flex rounded-[7px] p-[2px]" style={{ border: "1px solid var(--ws-hairline)" }}>
            {([
              { value: "score", label: "Highest score" },
              { value: "order", label: "Upload order" },
            ] as const).map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => onSortChange(o.value)}
                className="rounded-[5px] px-[10px] py-[5px] text-[11px] font-medium"
                style={sort === o.value ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" } : { color: "var(--ws-ink-60)" }}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ws-stack mt-[10px]">
        {sorted.map((item, i) => (
          <ScorecardRow key={item.id} item={item} rank={sort === "score" && item.status === "done" ? i + 1 : undefined} />
        ))}
      </div>
    </div>
  );
}

function ScorecardRow({ item, rank }: { item: QueueItem; rank?: number }) {
  const isVideo = item.file.type.startsWith("video/");
  const stage = useCyclingStage(item.status === "analyzing", isVideo ? VIDEO_STAGES : STATIC_STAGES);

  return (
    <div className="flex items-center gap-[12px]" style={{ padding: "11px 14px" }}>
      <span
        className="ws-tabular flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ background: "var(--ws-surface-header)", color: "var(--ws-ink-45)" }}
      >
        {rank ?? "–"}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
        {item.file.name}
      </span>
      {item.status === "done" && item.counts ? (
        <>
          <span className="hidden items-center gap-[8px] sm:inline-flex">
            <span className="ws-tabular inline-flex items-center gap-[4px] text-[11px]" style={{ color: "var(--ws-ink-60)" }}>
              <Dot color="var(--ws-accent-text)" />
              {item.counts.pass}
            </span>
            <span className="ws-tabular inline-flex items-center gap-[4px] text-[11px]" style={{ color: "var(--ws-ink-60)" }}>
              <Dot color="var(--ws-ink-45)" />
              {item.counts.partial}
            </span>
            <span className="ws-tabular inline-flex items-center gap-[4px] text-[11px]" style={{ color: "var(--ws-ink-60)" }}>
              <Dot color="var(--ws-warn-text)" />
              {item.counts.fail}
            </span>
          </span>
          <span className="ws-tabular shrink-0 text-[20px] font-bold" style={{ letterSpacing: "-0.03em", color: "var(--ws-ink)" }}>
            {item.score}
          </span>
          <Link href={`/signal/report/${item.assetId}`} className="ws-link-accent shrink-0 text-[11.5px] font-medium">
            View →
          </Link>
        </>
      ) : item.status === "error" ? (
        <span className="shrink-0 text-[11.5px] font-medium" style={{ color: "var(--ws-warn-text)" }}>
          Failed
        </span>
      ) : item.status === "analyzing" ? (
        <span className="inline-flex shrink-0 items-center gap-[6px] text-[11px]" style={{ color: "var(--ws-ink-60)" }}>
          <Spinner />
          {stage}
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-[6px] text-[11px] capitalize" style={{ color: "var(--ws-ink-45)" }}>
          {item.status === "uploading" && <Spinner />}
          {item.status}
        </span>
      )}
    </div>
  );
}

export async function analyzeOne(
  file: File,
  revisionOf?: string,
  platforms: Platform[] = ["Meta"]
): Promise<{ assetId: string; score: number; counts: { pass: number; partial: number; fail: number } }> {
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
    body: JSON.stringify({ path: urlData.path, filename: file.name, format, revisionOf, platforms }),
  });
  const analyzeData = await analyzeRes.json();
  if (!analyzeRes.ok) throw new Error(analyzeData.error ?? "Analysis failed.");

  return { assetId: analyzeData.assetId, score: analyzeData.score, counts: analyzeData.counts };
}

export function AnalyzeDropzone() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>(["Meta"]);
  const [scorecardSort, setScorecardSort] = useState<ScorecardSort>("score");
  const inputRef = useRef<HTMLInputElement>(null);
  const isBatch = queue.length > 1;

  const activeItem = queue.find((q) => q.status === "analyzing") ?? queue.find((q) => q.status === "uploading");
  const activeIsVideo = activeItem?.file.type.startsWith("video/") ?? true;
  const headlineStage = useCyclingStage(
    Boolean(activeItem && activeItem.status === "analyzing"),
    activeIsVideo ? VIDEO_STAGES : STATIC_STAGES
  );

  function togglePlatform(platform: Platform) {
    setPlatforms((prev) => {
      if (prev.includes(platform)) {
        // Always leave at least one platform selected — an asset needs
        // somewhere to be scored against.
        return prev.length === 1 ? prev : prev.filter((p) => p !== platform);
      }
      return [...prev, platform];
    });
  }

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
        const { assetId, score, counts } = await analyzeOne(item.file, undefined, platforms);
        lastAssetId = assetId;
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "done", assetId, score, counts } : q)));
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
    <div className={isBatch ? "mx-auto max-w-[640px]" : "mx-auto max-w-[520px]"}>
      {idle && (
        <div className="mb-[14px] flex items-center justify-center gap-[8px]">
          <span className="text-[11.5px] font-medium" style={{ color: "var(--ws-ink-45)" }}>
            Where will this run?
          </span>
          {ALL_PLATFORMS.map((platform) => {
            const active = platforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className="rounded-[20px] text-[11.5px] font-medium"
                style={{
                  padding: "5px 12px",
                  border: `1px solid ${active ? "var(--ws-accent)" : "var(--ws-hairline)"}`,
                  background: active ? "var(--ws-accent-tint)" : "transparent",
                  color: active ? "var(--ws-accent-tint-ink)" : "var(--ws-ink-60)",
                }}
              >
                {platform}
              </button>
            );
          })}
        </div>
      )}

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
            <p className="ws-eyebrow inline-flex items-center gap-[8px]">
              {running && <Spinner size={12} />}
              {running ? "PROCESSING" : "DONE"} · {queue.filter((q) => q.status === "done" || q.status === "error").length}/
              {queue.length}
            </p>
            <p className="mt-[10px] text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
              {running
                ? activeItem
                  ? headlineStage
                  : "Starting the next file…"
                : queue.some((q) => q.status === "error")
                  ? `${queue.filter((q) => q.status === "error").length} of ${queue.length} failed — see below.`
                  : "All files processed."}
            </p>
            <div
              className={`mt-[16px] h-[4px] w-full overflow-hidden rounded-[3px] ${running ? "ws-progress-indeterminate" : ""}`}
              style={{ background: "var(--ws-hairline)" }}
            >
              {!running && (
                <div
                  className="h-full rounded-[3px]"
                  style={{
                    width: `${(queue.filter((q) => q.status === "done" || q.status === "error").length / queue.length) * 100}%`,
                    background: "var(--ws-accent)",
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {isBatch ? (
        <Scorecard items={queue} sort={scorecardSort} onSortChange={setScorecardSort} />
      ) : (
        queue.length > 0 && (
          <div className="ws-stack mt-[18px]">
            {queue.map((item) => (
              <QueueRow key={item.id} item={item} />
            ))}
          </div>
        )
      )}

      {finished && (
        <div className="mt-[16px] flex justify-center gap-[8px]">
          <button type="button" onClick={reset} className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium" style={{ padding: "9px 14px" }}>
            {queue.some((q) => q.status === "error") ? "Try again" : "Analyze more"}
          </button>
          <Link href="/signal" className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "9px 14px" }}>
            Go to Library
          </Link>
        </div>
      )}
    </div>
  );
}
