"use client";

import { useEffect, useState } from "react";
import type { Asset, Criterion, Platform, PlatformScore, VideoFinding } from "../../data";
import { SAFE_ZONE_THRESHOLDS } from "../../data";
import { useCountUp, useRevealed } from "./score-reveal";
import type { PdfReportData } from "./report-pdf";
import { FindingsHeader, MedianBar, ReportHeader, ScoreCard, TierList, TopFixCard, formatTime, type TopFix, type VersionLink } from "./report-parts";
import { AppMain, Card, Mono, appStyles as s, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";

type Tick = "fail" | "good" | "neutral";

// Derived from this asset's real findings rather than hardcoded timing, so
// it's correct for any uploaded video.
function tickState(second: number, findings: VideoFinding[]): Tick {
  const nearby = findings.filter((f) => Math.abs(f.t - second) <= 1);
  if (nearby.some((f) => f.failure)) return "fail";
  if (nearby.length > 0) return "good";
  return "neutral";
}

const TICK_COLOR: Record<Tick, string> = { fail: "var(--ws-warn)", good: "var(--ws-grey)", neutral: "var(--ws-hairline)" };

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
  topFix: TopFix;
  median: number;
  percentile: number | null;
  frames?: { t: number; url: string }[];
  durationSeconds?: number;
  previousVersion?: VersionLink;
  nextVersion?: VersionLink;
}) {
  const duration = Math.max(1, Math.round(durationSeconds ?? 18));
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Claude only ever analyzed the sampled frames below, never continuous
  // video, so there's no real playback to sync to — the clock is a ±1s-step
  // interval that steps through those frames.
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

  const currentFrame =
    frames && frames.length > 0 ? frames.reduce((closest, frame) => (Math.abs(frame.t - t) < Math.abs(closest.t - t) ? frame : closest)) : null;

  // 8 of the 16 criteria (duration, hook-window timing, cut pace, safe zone)
  // vary by platform — switching tabs swaps in that platform's full result.
  // A platform row with an empty criteria array is stale data from before a
  // criteria-set update — treat it as unusable rather than rendering a
  // broken empty state.
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(asset.platforms[0]);
  const rawAltPlatform = platformScores.find((p) => p.platform === selectedPlatform);
  const altPlatform = rawAltPlatform && rawAltPlatform.criteria.length > 0 ? rawAltPlatform : null;
  const isStalePlatform = selectedPlatform !== asset.platforms[0] && !altPlatform;
  const activeScore = altPlatform ? altPlatform.score : asset.score;
  const displayCriteria = altPlatform ? altPlatform.criteria : criteria;
  const PLAYER_HEIGHT = 520;
  const zone = SAFE_ZONE_THRESHOLDS[selectedPlatform];
  const inViolation = findings.some((f) => f.failure && f.criterion.toLowerCase().includes("safe-zone") && Math.abs(f.t - t) <= 1);

  const displayScore = useCountUp(activeScore);
  const revealed = useRevealed();
  const tier1 = displayCriteria.filter((c) => c.tier === 1);
  const tier2 = displayCriteria.filter((c) => c.tier === 2);
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
    durationSeconds,
  };

  return (
    <AppMain>
      <ReportHeader asset={asset} pdfData={pdfData} previousVersion={previousVersion} nextVersion={nextVersion} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        {/* Player */}
        <div style={{ flex: "0 1 300px", minWidth: 0, width: 300, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div
              className={s.tile}
              style={{ height: PLAYER_HEIGHT, borderRadius: 16 }}
              role="img"
              aria-label={currentFrame ? `Frame at ${formatTime(currentFrame.t)}` : "No frame preview"}
            >
              {currentFrame ? (
                // eslint-disable-next-line @next/next/no-img-element -- a signed Supabase Storage URL, not a static asset next/image can optimize
                <img src={currentFrame.url} alt="" className={s.tileImg} />
              ) : (
                <span className={cx(s.emo, s.tileEmoji)} style={{ fontSize: 104 }} aria-hidden="true">
                  🎬
                </span>
              )}
              <span className={cx(s.mono, s.tileChip)}>
                {formatTime(t)} / {formatTime(duration)}
              </span>
              <span className={cx(s.mono, s.tileLabel)}>Safe zone · {selectedPlatform}</span>
              {inViolation && (
                <span className={cx(s.mono, s.tileChip)} style={{ top: "auto", bottom: 10, background: "var(--ws-warn)", color: "var(--ws-warn-ink)" }}>
                  Outside safe zone
                </span>
              )}
            </div>
            {/* Safe-zone guide: the area the selected platform's UI chrome leaves free. */}
            <div
              style={{ position: "absolute", left: 10, right: 10, top: `${zone.topPct}%`, bottom: `${zone.bottomPct}%`, border: "1.5px dashed var(--ws-accent)", borderRadius: 10, pointerEvents: "none" }}
              aria-hidden="true"
            />
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
              style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 60, height: 60, borderRadius: "50%", border: "none", background: "var(--ws-paper)", color: "var(--ws-paper-ink)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: playing ? 0.55 : 1 }}
            >
              <Icon name={playing ? "pause" : "play"} size={22} />
            </button>
          </div>
          <Card style={{ padding: "14px 16px", gap: 6, borderRadius: 16 }}>
            <Mono style={{ fontSize: 10, color: "var(--ws-accent)" }}>At {formatTime(t)}</Mono>
            <span style={{ fontSize: 13, color: "var(--ws-ink-60)", lineHeight: 1.45 }}>{describeFrame(t, findings)}</span>
          </Card>
        </div>

        {/* Score, timeline, tiers */}
        <div style={{ flex: "2 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <ScoreCard
            score={displayScore}
            scoreLabel={String(activeScore)}
            counts={counts}
            caption={`Best-practice score · video · ${displayCriteria.length} criteria`}
            note={percentile === null ? "First video analysed — not comparable to statics" : `${percentile}th percentile among your videos`}
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
          <MedianBar score={activeScore} median={median} format="video" />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <Mono className={s.cardLabel} style={{ fontSize: 11 }}>
                Timeline · click to jump
              </Mono>
              <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                0:00 — {formatTime(duration)}
              </Mono>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: duration + 1 }, (_, i) => i).map((second) => {
                const state = tickState(second, findings);
                return (
                  <button
                    key={second}
                    type="button"
                    aria-label={`Jump to ${formatTime(second)}`}
                    aria-current={second === t ? "true" : undefined}
                    onClick={() => setT(second)}
                    style={{ flex: 1, height: 34, border: "none", borderRadius: 6, background: TICK_COLOR[state], opacity: state === "neutral" ? 1 : 0.85, cursor: "pointer", boxShadow: second === t ? "0 0 0 2px var(--ws-accent)" : "none" }}
                  />
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--ws-ink-45)", flexWrap: "wrap" }}>
              <span>
                <span style={{ color: "var(--ws-grey)" }}>■</span> Meets guidance
              </span>
              <span>
                <span style={{ color: "var(--ws-hairline-strong)" }}>■</span> Nothing flagged
              </span>
              <span>
                <span style={{ color: "var(--ws-warn)" }}>■</span> Fails a check
              </span>
            </div>
          </div>

          <TierList title="Tier 1 · structural" criteria={tier1} />
          <TierList title="Tier 2 · contextual" criteria={tier2} />
        </div>

        {/* Findings */}
        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <TopFixCard topFix={topFix} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <FindingsHeader title="Findings · timestamped" hint="Click to jump" />
            {findings.map((finding) => {
              const active = Math.abs(finding.t - t) <= 1;
              return (
                <button
                  key={finding.id}
                  type="button"
                  onClick={() => seekTo(finding.t)}
                  style={{
                    display: "flex",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 14,
                    border: `1px solid ${active ? "var(--ws-accent)" : "var(--ws-hairline)"}`,
                    background: "var(--ws-surface)",
                    color: "var(--ws-ink)",
                    font: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className={cx(s.mono, s.tabular)}
                    style={{ flex: "none", fontSize: 10, padding: "4px 6px", borderRadius: 6, height: "fit-content", background: finding.failure ? "var(--ws-warn)" : "var(--ws-surface-header)", color: finding.failure ? "var(--ws-warn-ink)" : "var(--ws-ink)" }}
                  >
                    {formatTime(finding.t)}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{finding.criterion}</span>
                    <span style={{ fontSize: 12, color: "var(--ws-ink-45)", lineHeight: 1.4 }}>{finding.body}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AppMain>
  );
}
