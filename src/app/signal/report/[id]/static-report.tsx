"use client";

import { useState } from "react";
import type { Asset, Criterion, Platform, PlatformScore, StaticFinding } from "../../data";
import { SAFE_ZONE_THRESHOLDS } from "../../data";
import { ReportSubHeader, CriteriaTable } from "./video-report";
import { ScoreBreakdown, PlatformTabs } from "../../components";
import { useCountUp, useRevealed } from "./score-reveal";
import type { PdfReportData } from "./report-pdf";

const MARKER_STYLE: Record<StaticFinding["marker"], { bg: string; fg: string; label: string }> = {
  B: { bg: "var(--ws-warn)", fg: "var(--ws-warn-ink)", label: "B" },
  A: { bg: "var(--ws-ink)", fg: "var(--ws-ground)", label: "A" },
  check: { bg: "var(--ws-accent)", fg: "var(--ws-accent-ink)", label: "✓" },
};

export function StaticReport({
  asset,
  criteria,
  platformScores,
  findings,
  topFix,
  median,
  percentile,
  assetUrl,
  previousVersion,
  nextVersion,
}: {
  asset: Asset;
  criteria: Criterion[];
  platformScores: PlatformScore[];
  findings: StaticFinding[];
  topFix: { title: string; clears: number; body: string };
  median: number;
  percentile: number | null;
  assetUrl?: string | null;
  previousVersion?: { id: string; filename: string; score: number } | null;
  nextVersion?: { id: string; filename: string; score: number } | null;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Only safe zone varies by platform for a static image — switching tabs
  // swaps in that platform's full result.
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(asset.platforms[0]);
  const altPlatform = platformScores.find((p) => p.platform === selectedPlatform);
  const activeScore = selectedPlatform === asset.platforms[0] ? asset.score : altPlatform?.score ?? asset.score;
  const displayCriteria = altPlatform ? altPlatform.criteria : criteria;

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

  const FRAME_W = 300;
  const FRAME_H = 375;
  const zoneThresholds = SAFE_ZONE_THRESHOLDS[selectedPlatform];
  const topBandHeight = (zoneThresholds.topPct / 100) * FRAME_H;
  const bottomBandHeight = (zoneThresholds.bottomPct / 100) * FRAME_H;

  const pdfData: PdfReportData = { asset, criteria: displayCriteria, findings, topFix, median, percentile, thumbnailUrl: assetUrl };

  return (
    <div className="ws-page-in">
      <ReportSubHeader asset={asset} pdfData={pdfData} previousVersion={previousVersion} nextVersion={nextVersion} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-[22px] lg:flex-row" style={{ padding: "22px", borderRight: "1px solid var(--ws-hairline)" }}>
          {/* Frame column */}
          <div style={{ width: FRAME_W, flexShrink: 0 }}>
            <div
              className={assetUrl ? "relative overflow-hidden rounded-[10px]" : "ws-placeholder relative overflow-hidden rounded-[10px]"}
              style={{ width: FRAME_W, height: FRAME_H }}
            >
              {assetUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- a signed Supabase Storage URL, not a static asset next/image can optimize
                <img
                  src={assetUrl}
                  alt={asset.filename}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
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

              {findings.map((finding) => {
                const style = MARKER_STYLE[finding.marker];
                const active = hoveredId === finding.id;
                if (finding.marker === "B") {
                  return (
                    <div
                      key={finding.id}
                      className="absolute rounded-[4px]"
                      style={{
                        top: `${finding.region.top}%`,
                        left: `${finding.region.left}%`,
                        width: `${finding.region.width}%`,
                        height: `${finding.region.height}%`,
                        border: active ? `2.5px solid ${style.bg}` : `1.5px solid ${style.bg}`,
                        background: active ? "var(--ws-warn-tint)" : "transparent",
                        boxShadow: active ? "0 0 0 4px color-mix(in srgb, var(--ws-accent) 35%, transparent)" : "none",
                        zIndex: active ? 3 : 2,
                        transition: "background-color 0.15s ease, border-width 0.15s ease, box-shadow 0.15s ease",
                      }}
                    >
                      <span
                        className="absolute -top-[10px] left-[4px] rounded-[4px] text-[9px] font-semibold uppercase"
                        style={{ letterSpacing: "0.06em", padding: "3px 6px", background: style.bg, color: style.fg }}
                      >
                        B · CTA OUTSIDE
                      </span>
                    </div>
                  );
                }
                const cx = finding.region.left + finding.region.width / 2;
                const cy = finding.region.top + finding.region.height / 2;
                return (
                  <div
                    key={finding.id}
                    className="absolute flex items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      top: `${cy}%`,
                      left: `${cx}%`,
                      width: 26,
                      height: 26,
                      marginTop: -13,
                      marginLeft: -13,
                      background: style.bg,
                      color: style.fg,
                      boxShadow: active
                        ? "0 0 0 3px var(--ws-accent), 0 0 0 8px color-mix(in srgb, var(--ws-accent) 35%, transparent)"
                        : "none",
                      transform: active ? "scale(1.25)" : "scale(1)",
                      zIndex: active ? 3 : 2,
                      transition: "box-shadow 0.15s ease, transform 0.15s ease",
                    }}
                  >
                    {style.label}
                  </div>
                );
              })}
            </div>

            <p className="mt-[10px] text-[11.5px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
              Single-frame overlay. No timeline — nothing in a static ad changes over time.
            </p>
          </div>

          {/* Score column */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="ws-eyebrow">BEST PRACTICE SCORE (STATIC) — 7 CRITERIA</p>
              <PlatformTabs platforms={asset.platforms} selected={selectedPlatform} onSelect={setSelectedPlatform} />
            </div>
            <div className="mt-[10px]">
              <ScoreBreakdown score={displayScore} pass={counts.pass} partial={counts.partial} fail={counts.fail} revealed={revealed} />
              <p className="mt-[10px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                {percentile === null
                  ? "First static analyzed in this set — not comparable to video scores."
                  : `${percentile}th percentile among statics in this set — not comparable to video scores.`}
              </p>
            </div>

            <div className="mt-[14px]">
              <div className="relative h-[8px] overflow-hidden rounded-[4px]" style={{ background: "rgba(128,128,128,.14)" }}>
                <div
                  className="h-full rounded-[4px]"
                  style={{
                    width: revealed ? `${activeScore}%` : "0%",
                    background: "var(--ws-accent)",
                    transition: "width 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
                <div className="absolute top-0 h-full" style={{ left: `${median}%`, width: 2, background: "var(--ws-ink)" }} />
              </div>
              <div className="mt-[6px] flex justify-between text-[10.5px]" style={{ color: "var(--ws-ink-45)" }}>
                <span>0</span>
                <span>static median {median}</span>
                <span>100</span>
              </div>
            </div>

            <CriteriaTable title="TIER 1 · STRUCTURAL" issues={tier1Issues} total={tier1.length} criteria={tier1} />
            <div style={{ height: 16 }} />
            <CriteriaTable title="TIER 2 · CONTEXTUAL" issues={tier2Issues} total={tier2.length} criteria={tier2} />

            <p className="mt-[12px] text-[11.5px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
              Video-only checks are absent by design — a greyed row would read like a failure.
            </p>
          </div>
        </div>

        {/* Findings panel */}
        <div style={{ padding: "22px" }}>
          <div className="flex items-baseline justify-between">
            <p className="ws-eyebrow">FINDINGS · SPATIAL</p>
            <span className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>Hover to highlight the region</span>
          </div>

          <div className="mt-[14px] flex flex-col gap-[10px]">
            {findings.map((finding) => {
              const style = MARKER_STYLE[finding.marker];
              return (
                <div
                  key={finding.id}
                  onMouseEnter={() => setHoveredId(finding.id)}
                  onMouseLeave={() => setHoveredId((id) => (id === finding.id ? null : id))}
                  className="ws-card flex gap-[12px]"
                  style={{ padding: "12px 14px" }}
                >
                  <span
                    className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: style.bg, color: style.fg }}
                  >
                    {style.label}
                  </span>
                  <div>
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[12.5px] font-semibold" style={{ color: "var(--ws-ink)" }}>
                        {finding.criterion}
                      </span>
                      <span
                        className="text-[10px] font-semibold uppercase"
                        style={{ letterSpacing: "0.06em", color: "var(--ws-ink-45)" }}
                      >
                        TIER {finding.tier}
                      </span>
                    </div>
                    <p className="mt-[4px] text-[12.5px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
                      {finding.body}
                    </p>
                  </div>
                </div>
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
