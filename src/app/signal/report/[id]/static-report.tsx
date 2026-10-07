"use client";

import { useState } from "react";
import type { Asset, Criterion, Platform, PlatformScore, StaticFinding } from "../../data";
import { SAFE_ZONE_THRESHOLDS } from "../../data";
import { useCountUp, useRevealed } from "./score-reveal";
import type { PdfReportData } from "./report-pdf";
import { FindingsHeader, MedianBar, ReportHeader, ScoreCard, TierList, TopFixCard, type TopFix, type VersionLink } from "./report-parts";
import { AppMain, Mono, appStyles as s, cx } from "@/components/app/ui";

const MARKER_STYLE: Record<StaticFinding["marker"], { bg: string; fg: string; label: string }> = {
  B: { bg: "var(--ws-warn)", fg: "var(--ws-warn-ink)", label: "B" },
  A: { bg: "var(--ws-paper)", fg: "var(--ws-paper-ink)", label: "A" },
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
  topFix: TopFix;
  median: number;
  percentile: number | null;
  assetUrl?: string | null;
  previousVersion?: VersionLink;
  nextVersion?: VersionLink;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Only safe zone varies by platform for a static image — switching tabs
  // swaps in that platform's full result. A row with an empty criteria
  // array is stale data from before a criteria-set update — treat it as
  // unusable rather than rendering a broken empty state.
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(asset.platforms[0]);
  const rawAltPlatform = platformScores.find((p) => p.platform === selectedPlatform);
  const altPlatform = rawAltPlatform && rawAltPlatform.criteria.length > 0 ? rawAltPlatform : null;
  const isStalePlatform = selectedPlatform !== asset.platforms[0] && !altPlatform;
  const activeScore = altPlatform ? altPlatform.score : asset.score;
  const displayCriteria = altPlatform ? altPlatform.criteria : criteria;

  const displayScore = useCountUp(activeScore);
  const revealed = useRevealed();
  const tier1 = displayCriteria.filter((c) => c.tier === 1);
  const tier2 = displayCriteria.filter((c) => c.tier === 2);
  const counts = {
    pass: displayCriteria.filter((c) => c.verdict === "pass").length,
    partial: displayCriteria.filter((c) => c.verdict === "partial").length,
    fail: displayCriteria.filter((c) => c.verdict === "fail").length,
  };

  const zone = SAFE_ZONE_THRESHOLDS[selectedPlatform];
  const pdfData: PdfReportData = { asset, criteria: displayCriteria, findings, topFix, median, percentile, thumbnailUrl: assetUrl };

  return (
    <AppMain>
      <ReportHeader asset={asset} pdfData={pdfData} previousVersion={previousVersion} nextVersion={nextVersion} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 320px", minWidth: 0, width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div className={s.tile} style={{ height: 400, borderRadius: 16 }} role="img" aria-label={asset.filename}>
              {assetUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- a signed Supabase Storage URL, not a static asset next/image can optimize
                <img src={assetUrl} alt="" className={s.tileImg} />
              ) : (
                <span className={cx(s.emo, s.tileEmoji)} style={{ fontSize: 80 }} aria-hidden="true">
                  🖼️
                </span>
              )}
              <span className={cx(s.mono, s.tileLabel)}>Safe zone · {selectedPlatform}</span>
            </div>
            <div
              style={{ position: "absolute", left: 10, right: 10, top: `${zone.topPct}%`, bottom: `${zone.bottomPct}%`, border: "1.5px dashed var(--ws-accent)", borderRadius: 10, pointerEvents: "none" }}
              aria-hidden="true"
            />
            {findings.map((finding) => {
              const style = MARKER_STYLE[finding.marker];
              const active = hoveredId === finding.id;
              if (finding.marker === "B") {
                return (
                  <div
                    key={finding.id}
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: `${finding.region.top}%`,
                      left: `${finding.region.left}%`,
                      width: `${finding.region.width}%`,
                      height: `${finding.region.height}%`,
                      borderRadius: 4,
                      border: `${active ? 2.5 : 1.5}px solid ${style.bg}`,
                      background: active ? "var(--ws-warn-tint)" : "transparent",
                      zIndex: active ? 3 : 2,
                    }}
                  >
                    <span className={s.mono} style={{ position: "absolute", top: -10, left: 4, fontSize: 9, padding: "3px 6px", borderRadius: 4, background: style.bg, color: style.fg }}>
                      B · CTA outside
                    </span>
                  </div>
                );
              }
              const cx0 = finding.region.left + finding.region.width / 2;
              const cy0 = finding.region.top + finding.region.height / 2;
              return (
                <div
                  key={finding.id}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: `${cy0}%`,
                    left: `${cx0}%`,
                    width: 26,
                    height: 26,
                    margin: "-13px 0 0 -13px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    background: style.bg,
                    color: style.fg,
                    boxShadow: active ? "0 0 0 3px var(--ws-accent)" : "none",
                    transform: active ? "scale(1.25)" : "scale(1)",
                    zIndex: active ? 3 : 2,
                    transition: "transform 0.15s ease",
                  }}
                >
                  {style.label}
                </div>
              );
            })}
          </div>
          <span style={{ fontSize: 12, color: "var(--ws-ink-45)", lineHeight: 1.4 }}>Single-frame overlay. No timeline — nothing in a static ad changes over time.</span>
        </div>

        <div style={{ flex: "2 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <ScoreCard
            score={displayScore}
            scoreLabel={String(activeScore)}
            counts={counts}
            caption={`Best-practice score · static · ${displayCriteria.length} criteria`}
            note={percentile === null ? "First static analysed — not comparable to videos" : `${percentile}th percentile among your statics`}
            platforms={asset.platforms}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            revealed={revealed}
            stale={
              isStalePlatform
                ? `${selectedPlatform} hasn’t been scored with the current criteria yet — showing ${asset.platforms[0]}’s result instead. Upload a revision to refresh it.`
                : null
            }
          />
          <MedianBar score={activeScore} median={median} format="static" />
          <TierList title="Tier 1 · structural" criteria={tier1} />
          <TierList title="Tier 2 · contextual" criteria={tier2} />
          <span style={{ fontSize: 12, color: "var(--ws-ink-45)", lineHeight: 1.4 }}>Video-only checks are absent by design — a greyed row would read like a failure.</span>
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <TopFixCard topFix={topFix} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <FindingsHeader title="Findings · spatial" hint="Hover to highlight" />
            {findings.map((finding) => {
              const style = MARKER_STYLE[finding.marker];
              return (
                <div
                  key={finding.id}
                  onMouseEnter={() => setHoveredId(finding.id)}
                  onMouseLeave={() => setHoveredId((id) => (id === finding.id ? null : id))}
                  style={{ display: "flex", gap: 12, padding: 12, borderRadius: 14, border: `1px solid ${hoveredId === finding.id ? "var(--ws-accent)" : "var(--ws-hairline)"}`, background: "var(--ws-surface)" }}
                >
                  <span style={{ width: 22, height: 22, flex: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: style.bg, color: style.fg }}>{style.label}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      {finding.criterion} <Mono className={s.cardLabel} style={{ fontSize: 9, marginLeft: 6 }}>Tier {finding.tier}</Mono>
                    </span>
                    <span style={{ fontSize: 12, color: "var(--ws-ink-45)", lineHeight: 1.4 }}>{finding.body}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppMain>
  );
}
