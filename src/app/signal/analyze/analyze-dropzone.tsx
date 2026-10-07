"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Platform } from "../data";
import { Button, Mono, appStyles as s, cx } from "@/components/app/ui";
import { Segmented } from "@/components/app/controls";

type Target = "TikTok" | "Meta" | "Both";
const TARGET_PLATFORMS: Record<Target, Platform[]> = { TikTok: ["TikTok"], Meta: ["Meta"], Both: ["TikTok", "Meta"] };

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
    <svg className="ws-spin" style={{ flex: "none" }} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--ws-hairline-strong)" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--ws-accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: "1px solid var(--ws-hairline)" };
const fileName: React.CSSProperties = { flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const stageText: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ws-ink-60)", flex: "none" };

function QueueRow({ item }: { item: QueueItem }) {
  const isVideo = item.file.type.startsWith("video/");
  const stage = useCyclingStage(item.status === "analyzing", isVideo ? VIDEO_STAGES : STATIC_STAGES);

  return (
    <div style={{ ...rowStyle, flexWrap: "wrap" }}>
      <span style={fileName}>{item.file.name}</span>
      {item.status === "done" && item.assetId ? (
        <Link href={`/signal/report/${item.assetId}`} style={{ fontSize: 13, fontWeight: 600 }}>
          View report →
        </Link>
      ) : item.status === "error" ? (
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ws-warn)" }}>❌ Failed</span>
      ) : item.status === "analyzing" ? (
        <span style={stageText}>
          <Spinner />
          {stage}
        </span>
      ) : (
        <span style={{ ...stageText, color: "var(--ws-ink-45)", textTransform: "capitalize" }}>
          {item.status === "uploading" && <Spinner />}
          {item.status}
        </span>
      )}
      {item.status === "error" && item.error && <p style={{ flexBasis: "100%", margin: 0, fontSize: 13, color: "var(--ws-warn)", lineHeight: 1.4 }}>{item.error}</p>}
    </div>
  );
}

type ScorecardSort = "score" | "order";

// A live, sortable leaderboard for a batch upload (2+ files) — replaces the
// plain queue list once there's more than one item, so scoring 3-5 variants
// stays one working session instead of upload → wait → view → repeat for
// each one individually. Rows still in progress just sink to the bottom
// (no score yet) until they land.
function Scorecard({ items, sort, onSortChange }: { items: QueueItem[]; sort: ScorecardSort; onSortChange: (sort: ScorecardSort) => void }) {
  const anyDone = items.some((i) => i.status === "done");
  const sorted = sort === "score" ? [...items].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)) : items;

  return (
    <div style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-hairline)", borderRadius: 22, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px" }}>
        <Mono className={s.cardLabel} style={{ fontSize: 11 }}>
          Scorecard
        </Mono>
        {anyDone && (
          <Segmented
            label="Sort scorecard"
            value={sort}
            onChange={onSortChange}
            options={[
              { value: "score", label: "Highest score" },
              { value: "order", label: "Upload order" },
            ]}
          />
        )}
      </div>
      {sorted.map((item, i) => (
        <ScorecardRow key={item.id} item={item} rank={sort === "score" && item.status === "done" ? i + 1 : undefined} winner={sort === "score" && item.status === "done" && i === 0} />
      ))}
    </div>
  );
}

function ScorecardRow({ item, rank, winner }: { item: QueueItem; rank?: number; winner?: boolean }) {
  const isVideo = item.file.type.startsWith("video/");
  const stage = useCyclingStage(item.status === "analyzing", isVideo ? VIDEO_STAGES : STATIC_STAGES);

  return (
    <div style={{ ...rowStyle, ...(winner ? { boxShadow: "inset 2px 0 0 var(--ws-accent)", background: "var(--ws-surface-header)" } : null) }}>
      <span className={cx(s.mono, s.tabular)} style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: winner ? "var(--ws-accent)" : "var(--ws-surface-header)", color: winner ? "var(--ws-accent-ink)" : "var(--ws-ink-45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
        {rank ?? "–"}
      </span>
      <span style={fileName}>{item.file.name}</span>
      {item.status === "done" && item.counts ? (
        <>
          <span style={{ display: "inline-flex", gap: 10, fontSize: 13, color: "var(--ws-ink-60)", flex: "none" }}>
            <span>✅ {item.counts.pass}</span>
            <span>⚠️ {item.counts.partial}</span>
            <span style={{ color: item.counts.fail > 0 ? "var(--ws-warn)" : undefined }}>❌ {item.counts.fail}</span>
          </span>
          <span className={cx(s.disp, s.tabular)} style={{ fontSize: 24, flex: "none" }}>
            {item.score}
          </span>
          <Link href={`/signal/report/${item.assetId}`} style={{ fontSize: 13, fontWeight: 600, flex: "none" }}>
            View →
          </Link>
        </>
      ) : item.status === "error" ? (
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ws-warn)", flex: "none" }}>❌ Failed</span>
      ) : item.status === "analyzing" ? (
        <span style={stageText}>
          <Spinner />
          {stage}
        </span>
      ) : (
        <span style={{ ...stageText, color: "var(--ws-ink-45)", textTransform: "capitalize" }}>
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
  const [target, setTarget] = useState<Target>("Meta");
  const platforms = TARGET_PLATFORMS[target];
  const [scorecardSort, setScorecardSort] = useState<ScorecardSort>("score");
  const inputRef = useRef<HTMLInputElement>(null);
  const isBatch = queue.length > 1;

  const activeItem = queue.find((q) => q.status === "analyzing") ?? queue.find((q) => q.status === "uploading");
  const activeIsVideo = activeItem?.file.type.startsWith("video/") ?? true;
  const headlineStage = useCyclingStage(
    Boolean(activeItem && activeItem.status === "analyzing"),
    activeIsVideo ? VIDEO_STAGES : STATIC_STAGES
  );

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

  const doneCount = queue.filter((q) => q.status === "done" || q.status === "error").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {idle && (
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>Where will this run?</span>
          <Segmented
            label="Where will this run?"
            value={target}
            onChange={setTarget}
            options={[
              { value: "TikTok", label: "TikTok" },
              { value: "Meta", label: "Meta" },
              { value: "Both", label: "Both" },
            ]}
          />
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragOver ? "var(--ws-accent)" : "var(--ws-hairline-strong)"}`,
          borderRadius: 28,
          padding: idle ? "64px 32px" : "44px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
          background: dragOver ? "var(--ws-surface-header)" : "var(--ws-surface)",
          transition: "background-color 0.15s ease, border-color 0.15s ease",
        }}
      >
        <input ref={inputRef} type="file" multiple accept="video/*,image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />

        {idle && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }} aria-hidden="true">
              {[
                { w: 64, h: 110, e: "🎬" },
                { w: 88, h: 88, e: "🖼️" },
                { w: 64, h: 110, e: "🎞️" },
              ].map((t) => (
                <div key={t.e} style={{ width: t.w, height: t.h, flex: "none", borderRadius: 16, background: "radial-gradient(120% 80% at 30% 20%, #34322c 0%, #1a1917 55%, #0f0f0e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className={s.emo} style={{ fontSize: 28 }}>
                    {t.e}
                  </span>
                </div>
              ))}
            </div>
            <span className={s.disp} style={{ fontSize: 28, marginTop: 8 }}>
              Drop assets to analyse
            </span>
            <span style={{ fontSize: 15, color: "var(--ws-ink-60)" }}>Static or video, one or many · up to 500 MB each</span>
            <Button variant="primary" icon="upload" onClick={() => inputRef.current?.click()}>
              Choose files
            </Button>
          </>
        )}

        {!idle && (
          <>
            <Mono style={{ fontSize: 11, color: "var(--ws-accent)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              {running && <Spinner size={12} />}
              {running ? "Processing" : "Done"} · {doneCount}/{queue.length}
            </Mono>
            <span style={{ fontSize: 15, color: "var(--ws-ink-60)" }}>
              {running
                ? activeItem
                  ? headlineStage
                  : "Starting the next file…"
                : queue.some((q) => q.status === "error")
                  ? `${queue.filter((q) => q.status === "error").length} of ${queue.length} failed — see below.`
                  : "All files processed."}
            </span>
            <div className={running ? "ws-progress-indeterminate" : undefined} style={{ height: 4, width: "100%", maxWidth: 420, borderRadius: 2, background: "var(--ws-hairline)", overflow: "hidden" }}>
              {!running && <div style={{ height: "100%", borderRadius: 2, width: `${(doneCount / queue.length) * 100}%`, background: "var(--ws-accent)" }} />}
            </div>
          </>
        )}
      </div>

      {isBatch ? (
        <Scorecard items={queue} sort={scorecardSort} onSortChange={setScorecardSort} />
      ) : (
        queue.length > 0 && (
          <div style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-hairline)", borderRadius: 22, overflow: "hidden" }}>
            {queue.map((item) => (
              <QueueRow key={item.id} item={item} />
            ))}
          </div>
        )
      )}

      {finished && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <Button variant="ghost" onClick={reset}>
            {queue.some((q) => q.status === "error") ? "Try again" : "Analyse more"}
          </Button>
          <Button variant="primary" href="/signal">
            Go to Library
          </Button>
        </div>
      )}

      {idle && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {[
            ["01", "Format detected", "Video or static, and its aspect ratio — the right criteria set is applied automatically."],
            ["02", "Scored tier by tier", "Structural checks first, then contextual ones, each with a timestamp where it applies."],
            ["03", "Benchmarked", "Placed against everything you’ve analysed in that format, so the number means something."],
          ].map(([n, title, body], i) => (
            <div key={n} style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 8, paddingTop: 16, borderTop: `2px solid ${i === 0 ? "var(--ws-accent)" : "var(--ws-hairline-strong)"}` }}>
              <Mono style={{ fontSize: 10, color: i === 0 ? "var(--ws-accent)" : "var(--ws-ink-45)" }}>{n}</Mono>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
              <span style={{ fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.45 }}>{body}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
