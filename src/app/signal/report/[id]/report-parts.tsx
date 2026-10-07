"use client";

import Link from "next/link";
import type { Asset, Criterion, Platform } from "../../data";
import { Button, Card, Chip, Mono, Status, appStyles as s, cx, statusEmoji, type StatusKind } from "@/components/app/ui";
import { Segmented } from "@/components/app/controls";
import { Icon } from "@/components/app/icons";
import { ExportPdfButton, type PdfReportData } from "./report-pdf";
import { ReanalyzeButton } from "./reanalyze-button";
import { CompareButton } from "./compare-button";

export type VersionLink = { id: string; filename: string; score: number } | null | undefined;
export type TopFix = { title: string; clears: number; criteria: string[]; body: string };

export function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const sec = Math.floor(totalSeconds % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// Top row of every report: back link, filename, format chip, platforms and
// date, revision links, and the three page-level actions.
export function ReportHeader({
  asset,
  pdfData,
  previousVersion,
  nextVersion,
}: {
  asset: Asset;
  pdfData: PdfReportData;
  previousVersion?: VersionLink;
  nextVersion?: VersionLink;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
      <Link href="/signal" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ws-ink-45)" }}>
        <Icon name="chevronLeft" size={14} />
        Library
      </Link>
      <span className={s.disp} style={{ fontSize: 26, letterSpacing: "-0.02em", textTransform: "none" }}>
        {asset.filename}
      </span>
      <Chip variant="outline">{asset.format === "video" ? `Video · ${asset.duration} · 9:16` : "Static"}</Chip>
      <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>
        {asset.platforms.join(" + ")} · {asset.postedAt}
      </span>
      {previousVersion && (
        <Link href={`/signal/report/${previousVersion.id}`} style={{ fontSize: 12, color: "var(--ws-ink-45)" }}>
          ← Revision of {previousVersion.filename} ({previousVersion.score})
        </Link>
      )}
      {nextVersion && (
        <Link href={`/signal/report/${nextVersion.id}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--ws-accent)" }}>
          Newer revision: {nextVersion.filename} ({nextVersion.score}) →
        </Link>
      )}
      <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <CompareButton assetId={asset.id} format={asset.format} />
        <ExportPdfButton data={pdfData} />
        <ReanalyzeButton assetId={asset.id} platforms={asset.platforms} />
      </div>
    </div>
  );
}

// Ring gauge + verdict counts. The ring is the same weighted score
// computeScore() produces, drawn as a shape rather than spelled-out maths.
export function ScoreCard({
  score,
  counts,
  caption,
  note,
  platforms,
  selectedPlatform,
  onSelectPlatform,
  stale,
  revealed,
  scoreLabel,
}: {
  score: number;
  counts: { pass: number; partial: number; fail: number };
  caption: string;
  note: string;
  platforms: Platform[];
  selectedPlatform: Platform;
  onSelectPlatform: (p: Platform) => void;
  stale?: string | null;
  revealed: boolean;
  scoreLabel: string;
}) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const arc = revealed ? (Math.min(100, score) / 100) * C : 0;
  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
        <div style={{ position: "relative", width: 132, height: 132, flex: "none" }}>
          <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
            <circle cx="66" cy="66" r={R} fill="none" stroke="var(--ws-surface-header)" strokeWidth="12" />
            <circle
              cx="66"
              cy="66"
              r={R}
              fill="none"
              stroke="var(--ws-accent)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${arc} ${C}`}
              transform="rotate(-90 66 66)"
              style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span className={s.disp} style={{ fontSize: 44, letterSpacing: "-0.05em", lineHeight: 0.9 }} aria-label={`Score ${scoreLabel} out of 100`}>
              {score}
            </span>
            <Mono className={s.cardLabel} style={{ fontSize: 9 }}>
              /100
            </Mono>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 10 }}>
          <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
            {caption}
          </Mono>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{note}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["pass", "partial", "fail"] as const).map((k) => (
              <Chip key={k} variant={k === "fail" ? "fail" : "soft"}>
                <span className={s.emo} aria-hidden="true">
                  {statusEmoji(k)}
                </span>
                {counts[k]} {k}
              </Chip>
            ))}
          </div>
          {platforms.length > 1 && (
            <Segmented
              label="Platform criteria"
              value={selectedPlatform}
              onChange={onSelectPlatform}
              options={platforms.map((p) => ({ value: p, label: p }))}
            />
          )}
          {stale && <span style={{ fontSize: 13, color: "var(--ws-warn)", lineHeight: 1.4 }}>{stale}</span>}
        </div>
      </div>
    </Card>
  );
}

export function MedianBar({ score, median, format }: { score: number; median: number; format: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ position: "relative", height: 8, borderRadius: 4, background: "var(--ws-surface-header)", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 4, background: "var(--ws-paper)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${median}%`, width: 2, background: "var(--ws-accent)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Mono className={s.cardLabel} style={{ fontSize: 9 }}>
          0
        </Mono>
        <Mono className={s.cardLabel} style={{ fontSize: 9 }}>
          {format} median {median}
        </Mono>
        <Mono className={s.cardLabel} style={{ fontSize: 9 }}>
          100
        </Mono>
      </div>
    </div>
  );
}

// One tier as a native <details>: criteria with an emoji + text status, the
// evidence line underneath.
export function TierList({ title, criteria }: { title: string; criteria: Criterion[] }) {
  if (criteria.length === 0) return null;
  const passing = criteria.filter((c) => c.verdict === "pass").length;
  return (
    <details open style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-hairline)", borderRadius: 20, padding: "18px 22px" }}>
      <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Mono style={{ fontSize: 11 }}>{title}</Mono>
        <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>
          {passing} / {criteria.length} pass
        </span>
      </summary>
      <div style={{ marginTop: 10 }}>
        {criteria.map((c) => (
          <div key={c.name} style={{ display: "flex", gap: 14, padding: "13px 0", borderTop: "1px solid var(--ws-hairline)" }}>
            <span className={s.emo} style={{ fontSize: 15 }} aria-hidden="true">
              {statusEmoji(c.verdict as StatusKind)}
            </span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontSize: 13, color: "var(--ws-ink-45)", lineHeight: 1.45 }}>{c.evidence}</span>
            </div>
            <Status kind={c.verdict as StatusKind} />
          </div>
        ))}
      </div>
    </details>
  );
}

// Always first in the right column — the single most useful thing to change.
export function TopFixCard({ topFix }: { topFix: TopFix }) {
  if (!topFix.title) return null;
  return (
    <Card paper ring>
      <Mono className={s.cardLabel} style={{ fontSize: 10, color: "#55534d" }}>
        Top fix · clears {topFix.clears} check{topFix.clears === 1 ? "" : "s"}
      </Mono>
      <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.3 }}>{topFix.title}</span>
      <span style={{ fontSize: 14, color: "#46443f", lineHeight: 1.5 }}>{topFix.body}</span>
      {topFix.criteria.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {topFix.criteria.map((c) => (
            <Chip key={c} variant="white">
              {c}
            </Chip>
          ))}
        </div>
      )}
    </Card>
  );
}

export function FindingsHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <Mono className={s.cardLabel} style={{ fontSize: 11 }}>
        {title}
      </Mono>
      <Mono className={cx(s.cardLabel)} style={{ fontSize: 9 }}>
        {hint}
      </Mono>
    </div>
  );
}

export { Button };
