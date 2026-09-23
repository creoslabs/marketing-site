"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Asset, Criterion, Platform, PlatformScore, VideoFinding } from "../../data";
import { SAFE_ZONE_THRESHOLDS } from "../../data";
import { VerdictLabel, ScoreBreakdown, PlatformTabs } from "../../components";
import { useCountUp, useRevealed } from "./score-reveal";
import { CompareButton } from "./compare-button";
import { ExportPdfButton, type PdfReportData } from "./report-pdf";
import { ReanalyzeButton } from "./reanalyze-button";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Derived from this asset's real findings rather than hardcoded timing, so
// it's correct for any uploaded video, not just the one fixture example.
function tickState(second: number, findings: VideoFinding[]): "good" | "weak" | "warn" {
  const nearby = findings.filter((f) => Math.abs(f.t - second) <= 1);
  if (nearby.some((f) => f.failure)) return "warn";
  if (nearby.length > 0) return "good";
  return "weak";
}

function describeFrame(t: number, findings: VideoFinding[]) {
  const nearby = findings.find((f) => Math.abs(f.t - t) <= 1);
  return nearby ? nearby.body : "Nothing flagged at this frame.";
}

export function VideoReport({
  asset,
  criteria,
  platformScores,
  findings,
  topFix,
  median,
  percentile,
  frames,
  durationSeconds,
  previousVersion,
  nextVersion,
}: {
  asset: Asset;
  criteria: Criterion[];
  platformScores: PlatformScore[];
  findings: VideoFinding[];
  topFix: { title: string; clears: number; body: string };
  median: number;
  percentile: number | null;
  frames?: { t: number; url: string }[];
  durationSeconds?: number;
  previousVersion?: { id: string; filename: string; score: number } | null;
  nextVersion?: { id: string; filename: string; score: number } | null;
}) {
  const duration = Math.max(1, Math.round(durationSeconds ?? 18));
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Claude only ever analyzed the sampled frames below, never continuous
  // video, so there's no real playback to sync to — the clock is always a
  // fake ±1s-step interval, same as the old fixture-only stand-in.
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setT((prev) => (prev >= duration ? 0 : prev + 1));
    }, 650);
    return () => clearInterval(interval);
  }, [playing, duration]);

  function seekTo(next: number) {
    setT(Math.max(0, Math.min(duration, next)));
  }

  function togglePlay() {
    setPlaying((p) => !p);
  }

  const currentFrame =
    frames && frames.length > 0
      ? frames.reduce((closest, frame) => (Math.abs(frame.t - t) < Math.abs(closest.t - t) ? frame : closest))
      : null;

  const inViolation = findings.some(
    (f) => f.failure && f.criterion.toLowerCase().includes("safe-zone") && Math.abs(f.t - t) <= 1
  );

  // 8 of the 16 criteria (duration, hook-window timing, cut pace, safe zone)
  // vary by platform — switching tabs swaps in that platform's full result.
  // A platform row with an empty criteria array is stale data from before a
  // criteria-set update (it was analyzed, then the schema/prompt changed) —
  // treat it as unusable rather than rendering a broken empty state.
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(asset.platforms[0]);
  const rawAltPlatform = platformScores.find((p) => p.platform === selectedPlatform);
  const altPlatform = rawAltPlatform && rawAltPlatform.criteria.length > 0 ? rawAltPlatform : null;
  const isStalePlatform = selectedPlatform !== asset.platforms[0] && !altPlatform;
  const activeScore = altPlatform ? altPlatform.score : asset.score;
  const displayCriteria = altPlatform ? altPlatform.criteria : criteria;
  const PLAYER_HEIGHT = 444;
  const zoneThresholds = SAFE_ZONE_THRESHOLDS[selectedPlatform];
  const topBandHeight = (zoneThresholds.topPct / 100) * PLAYER_HEIGHT;
  const bottomBandHeight = (zoneThresholds.bottomPct / 100) * PLAYER_HEIGHT;

  const displayScore = useCountUp(activeScore);
  const revealed = useRevealed();
  const tier1 = displayCriteria.filter((c) => c.tier === 1);
  const tier2 = displayCriteria.filter((c) => c.tier === 2);
  const tier1Issues = tier1.filter((c) => c.verdict !== "pass").length;
  const tier2Issues = tier2.filter((c) => c.verdict !== "pass").length;
  const counts = {
    pass: displayCriteria.filter((c) => c.verdict === "pass").length,
    partial: displayCriteria.filter((c) => c.verdict === "partial").length,
    fail: displayCriteria.filter((c) => c.verdict === "fail").length,
  };

  const pdfData: PdfReportData = {
    asset,
    criteria: displayCriteria,
    findings,
    topFix,
    median,
    percentile,
    thumbnailUrl: frames && frames.length > 0 ? frames[0].url : null,
  };

  return (
    <div className="ws-page-in">
      <ReportSubHeader asset={asset} pdfData={pdfData} previousVersion={previousVersion} nextVersion={nextVersion} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]" style={{ minHeight: 0 }}>
        {/* Left: player + score */}
        <div className="flex flex-col gap-[22px] lg:flex-row" style={{ padding: "22px", borderRight: "1px solid var(--ws-hairline)" }}>
          {/* Player column */}
          <div style={{ width: 250, flexShrink: 0 }}>
            <div
              className={currentFrame ? "relative overflow-hidden rounded-[10px]" : "ws-placeholder relative overflow-hidden rounded-[10px]"}
              style={{ width: 250, height: 444 }}
            >
              {currentFrame && (
                // eslint-disable-next-line @next/next/no-img-element -- a signed Supabase Storage URL, not a static asset next/image can optimize
                <img
                  src={currentFrame.url}
                  alt={`Frame at ${formatTime(currentFrame.t)}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {/* Safe-zone bands — sized to the selected platform's own UI-chrome margins */}
              <div
                className="absolute inset-x-0 top-0"
                style={{ height: topBandHeight, background: "color-mix(in srgb, var(--ws-warn) 16%, transparent)", borderBottom: "1.5px dashed var(--ws-warn)" }}
              />
              <div
                className="absolute inset-x-0 bottom-0"
                style={{ height: bottomBandHeight, background: "color-mix(in srgb, var(--ws-warn) 16%, transparent)", borderTop: "1.5px dashed var(--ws-warn)" }}
              />
              <div
                className="absolute"
                style={{ top: topBandHeight, bottom: bottomBandHeight, left: 14, right: 14, border: "1.5px dashed var(--ws-accent)" }}
              />
              <span
                className="absolute rounded-[4px] text-[9px] font-semibold uppercase"
                style={{ bottom: bottomBandHeight + 4, left: 14, letterSpacing: "0.06em", padding: "3px 6px", background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }}
              >
                SAFE ZONE · {selectedPlatform.toUpperCase()}
              </span>

              {/* Violation overlay */}
              <div
                className="absolute rounded-[4px]"
                style={{
                  top: 4,
                  left: 14,
                  right: 14,
                  height: 108,
                  border: "1.5px solid var(--ws-warn)",
                  background: "var(--ws-warn-tint)",
                  opacity: inViolation ? 1 : 0,
                  transition: "opacity 0.15s ease",
                }}
              >
                <span
                  className="absolute -top-[10px] left-[6px] rounded-[4px] text-[9px] font-semibold uppercase"
                  style={{ letterSpacing: "0.06em", padding: "3px 6px", background: "var(--ws-warn)", color: "var(--ws-warn-ink)" }}
                >
                  OUTSIDE SAFE ZONE
                </span>
              </div>

              <span
                className="absolute left-[10px] top-[10px] rounded-[4px] text-[10px] font-semibold"
                style={{ padding: "4px 7px", background: "var(--ws-ink)", color: "var(--ws-ground)" }}
              >
                {formatTime(t)} / {formatTime(duration)}
              </span>
            </div>

            <div className="mt-[10px] flex items-center gap-[6px]">
              <button
                type="button"
                onClick={() => seekTo(t - 1)}
                className="ws-btn-ghost rounded-[7px] text-[13px]"
                style={{ padding: "9px 12px" }}
              >
                ◀
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="ws-btn-primary flex-1 rounded-[7px] text-[12.5px] font-semibold"
                style={{ padding: "9px 12px" }}
              >
                {playing ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={() => seekTo(t + 1)}
                className="ws-btn-ghost rounded-[7px] text-[13px]"
                style={{ padding: "9px 12px" }}
              >
                ▶
              </button>
            </div>

            <div className="ws-card mt-[10px]" style={{ padding: "12px 14px" }}>
              <p className="ws-eyebrow">AT {formatTime(t)}</p>
              <p className="mt-[6px] text-[12.5px] leading-[1.4]" style={{ color: "var(--ws-ink-60)" }}>
                {describeFrame(t, findings)}
              </p>
            </div>
          </div>

          {/* Score column */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="ws-eyebrow">BEST PRACTICE SCORE (VIDEO) — 16 CRITERIA</p>
              <PlatformTabs platforms={asset.platforms} selected={selectedPlatform} onSelect={setSelectedPlatform} />
            </div>
            <div className="mt-[10px]">
              <ScoreBreakdown score={displayScore} pass={counts.pass} partial={counts.partial} fail={counts.fail} revealed={revealed} />
              {isStalePlatform && (
                <p className="mt-[10px] text-[11.5px] leading-[1.4]" style={{ color: "var(--ws-warn-text)" }}>
                  {selectedPlatform} hasn&apos;t been scored with the current criteria yet — showing {asset.platforms[0]}&apos;s
                  result instead. Upload a revision to refresh it.
                </p>
              )}
              <p className="mt-[10px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                {percentile === null
                  ? "First video analyzed in this set — not comparable to static scores."
                  : `${percentile}th percentile among video ads in this set — not comparable to static scores.`}
              </p>
            </div>

            <div className="mt-[14px]">
              <div className="relative h-[8px] overflow-hidden rounded-[4px]" style={{ background: "rgba(128,128,128,.14)" }}>
                <div
                  className="h-full rounded-[4px]"
                  style={{
                    width: revealed ? `${activeScore}%` : "0%",
                    background: "var(--ws-ink)",
                    transition: "width 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
                <div className="absolute top-0 h-full" style={{ left: `${median}%`, width: 2, background: "var(--ws-ink)" }} />
              </div>
              <div className="mt-[6px] flex justify-between text-[10.5px]" style={{ color: "var(--ws-ink-45)" }}>
                <span>0</span>
                <span>video median {median}</span>
                <span>100</span>
              </div>
            </div>

            <p className="ws-eyebrow mt-[20px]">TIMELINE · CLICK TO SCRUB</p>
            <div className="relative mt-[10px]">
              <div className="flex" style={{ gap: 2 }}>
                {Array.from({ length: duration + 1 }, (_, i) => i).map((second) => {
                  const state = tickState(second, findings);
                  const isCurrent = second === t;
                  return (
                    <button
                      key={second}
                      type="button"
                      onClick={() => seekTo(second)}
                      className="flex-1 rounded-[3px]"
                      style={{
                        height: 52,
                        background:
                          state === "warn"
                            ? "color-mix(in srgb, var(--ws-warn) 75%, transparent)"
                            : state === "good"
                              ? "color-mix(in srgb, var(--ws-accent) 70%, transparent)"
                              : "rgba(128,128,128,.14)",
                        boxShadow: isCurrent ? "inset 0 0 0 2px var(--ws-ink)" : "none",
                      }}
                    />
                  );
                })}
              </div>
              <div
                className="pointer-events-none absolute rounded-[2px]"
                style={{
                  top: -4,
                  bottom: -4,
                  width: 2,
                  left: `${(t / duration) * 100}%`,
                  background: "var(--ws-ink)",
                  transition: "left 0.15s ease",
                }}
              />
              <div className="mt-[6px] flex" style={{ gap: 2 }}>
                {Array.from({ length: duration + 1 }, (_, i) => i).map((second) => (
                  <div key={second} className="flex-1 text-center text-[9px]" style={{ color: "var(--ws-ink-45)" }}>
                    {second % 3 === 0 ? formatTime(second) : ""}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-[10px] flex items-center gap-[16px] text-[11.5px]" style={{ color: "var(--ws-ink-60)" }}>
              <LegendSwatch color="var(--ws-accent)" label="Meets guidance" />
              <LegendSwatch color="rgba(128,128,128,.3)" label="Neutral" />
              <LegendSwatch color="var(--ws-warn)" label="Fails a check" />
            </div>

            <CriteriaTable title="TIER 1 · STRUCTURAL" issues={tier1Issues} total={tier1.length} criteria={tier1} />
            <div style={{ height: 16 }} />
            <CriteriaTable title="TIER 2 · CONTEXTUAL" issues={tier2Issues} total={tier2.length} criteria={tier2} />
          </div>
        </div>

        {/* Findings panel */}
        <div style={{ padding: "22px" }}>
          <div className="flex items-baseline justify-between">
            <p className="ws-eyebrow">FINDINGS · TIMESTAMPED</p>
            <span className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>Click a note to jump</span>
          </div>

          <div className="mt-[14px] flex flex-col gap-[10px]">
            {findings.map((finding) => {
              const active = Math.abs(finding.t - t) <= 1;
              return (
                <button
                  key={finding.id}
                  type="button"
                  onClick={() => seekTo(finding.t)}
                  className="rounded-[8px] text-left"
                  style={{
                    padding: "12px 14px",
                    border: active ? "1px solid var(--ws-accent)" : "1px solid var(--ws-hairline)",
                    background: active ? "var(--ws-accent-tint)" : "var(--ws-surface)",
                    transition: "background-color 0.15s ease, border-color 0.15s ease",
                  }}
                >
                  <div className="flex items-center gap-[8px]">
                    <span
                      className="ws-tabular rounded-[4px] text-[10.5px] font-semibold"
                      style={{
                        padding: "2px 6px",
                        background: finding.failure ? "var(--ws-warn)" : "var(--ws-surface-header)",
                        color: finding.failure ? "var(--ws-warn-ink)" : "var(--ws-ink-60)",
                      }}
                    >
                      {formatTime(finding.t)}
                    </span>
                    <span className="text-[12.5px] font-semibold" style={{ color: active ? "var(--ws-accent-tint-ink)" : "var(--ws-ink)" }}>
                      {finding.criterion}
                    </span>
                    <div className="flex-1" />
                    <span
                      className="text-[10px] font-semibold uppercase"
                      style={{ letterSpacing: "0.06em", color: "var(--ws-ink-45)" }}
                    >
                      TIER {finding.tier}
                    </span>
                  </div>
                  <p
                    className="mt-[6px] text-[12.5px] leading-[1.5]"
                    style={{ color: active ? "var(--ws-accent-tint-ink)" : "var(--ws-ink-60)" }}
                  >
                    {finding.body}
                  </p>
                </button>
              );
            })}
          </div>

          <div
            className="mt-[16px] rounded-[10px]"
            style={{ padding: "16px 18px", background: "var(--ws-accent-tint)", border: "1px solid var(--ws-accent-tint-border)" }}
          >
            <p className="ws-eyebrow" style={{ color: "var(--ws-accent-tint-ink)" }}>
              TOP FIX · CLEARS {topFix.clears} CHECK{topFix.clears === 1 ? "" : "S"}
            </p>
            <p className="mt-[8px] text-[12.5px] font-semibold" style={{ color: "var(--ws-accent-tint-ink)" }}>
              {topFix.title}
            </p>
            <p className="mt-[6px] text-[12.5px] leading-[1.5]" style={{ color: "var(--ws-accent-tint-ink)" }}>
              {topFix.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-[6px]">
      <span className="h-[8px] w-[8px] rounded-[2px]" style={{ background: color }} />
      {label}
    </span>
  );
}

export function CriteriaTable({
  title,
  issues,
  total,
  criteria,
}: {
  title: string;
  issues: number;
  total: number;
  criteria: Criterion[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="ws-stack mt-[16px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-[8px] text-left"
        style={{ padding: "10px 14px", background: "var(--ws-surface-header)" }}
      >
        <span
          className="inline-block text-[9px]"
          style={{
            color: "var(--ws-ink-45)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s ease",
          }}
        >
          ▾
        </span>
        <span className="ws-eyebrow">{title}</span>
        <div className="flex-1" />
        <span className="ws-tabular text-[12px] font-semibold" style={{ color: "var(--ws-ink-60)" }}>
          {issues} / {total}
        </span>
      </button>
      {open &&
        criteria.map((c) => (
          <div key={c.name} style={{ padding: "10px 14px" }}>
            <div className="flex items-center gap-[10px]">
              <span className="flex-1 text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                {c.name}
              </span>
              <VerdictLabel verdict={c.verdict} />
            </div>
            <p className="mt-[4px] text-[11.5px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
              {c.evidence}
            </p>
          </div>
        ))}
    </div>
  );
}

export function ReportSubHeader({
  asset,
  pdfData,
  previousVersion,
  nextVersion,
}: {
  asset: Asset;
  pdfData: PdfReportData;
  previousVersion?: { id: string; filename: string; score: number } | null;
  nextVersion?: { id: string; filename: string; score: number } | null;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-[14px] px-6"
      style={{ minHeight: 56, padding: "12px 22px", borderBottom: "1px solid var(--ws-hairline)" }}
    >
      <Link href="/signal" className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
        ← Library
      </Link>
      <div className="h-[18px] w-px" style={{ background: "var(--ws-hairline)" }} />
      <span className="text-[13.5px] font-semibold" style={{ color: "var(--ws-ink)" }}>{asset.filename}</span>
      <span
        className="rounded-[4px] text-[11px] font-semibold uppercase"
        style={{ letterSpacing: "0.06em", padding: "4px 7px", background: "var(--ws-ink)", color: "var(--ws-ground)" }}
      >
        {asset.format === "video" ? `VIDEO · ${asset.duration} · 9:16` : "STATIC · 4:5"}
      </span>
      <span className="text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
        {asset.platforms.join(" + ")} · {asset.postedAt}
      </span>
      {previousVersion && (
        <Link href={`/signal/report/${previousVersion.id}`} className="text-[11.5px] font-medium" style={{ color: "var(--ws-ink-45)" }}>
          ← Revision of {previousVersion.filename} ({previousVersion.score})
        </Link>
      )}
      {nextVersion && (
        <Link href={`/signal/report/${nextVersion.id}`} className="text-[11.5px] font-medium" style={{ color: "var(--ws-accent-text)" }}>
          Newer revision: {nextVersion.filename} ({nextVersion.score}) →
        </Link>
      )}
      <div className="flex-1" />
      <ReanalyzeButton assetId={asset.id} platforms={asset.platforms} />
      <ExportPdfButton data={pdfData} />
      <CompareButton assetId={asset.id} format={asset.format} />
    </div>
  );
}
