import type { Metadata } from "next";
import Link from "next/link";
import { ASSETS, MEDIAN_BY_FORMAT, getPercentile as getFixturePercentile, ACCOUNT_PATTERN } from "./data";
import { getLibrary, medianOf, percentileWithin } from "./live-data";
import { ScoreBadge, IssuePill, Thumb } from "./components";
import { AppearanceCard } from "./appearance-card";

export const metadata: Metadata = {
  title: "Library — Signal",
  robots: { index: false, follow: false },
};

const GRID_COUNT = 8;

export default async function LibraryPage() {
  const live = await getLibrary();
  const assets = live.isLive ? live.assets : ASSETS;
  const isLive = live.isLive;

  const medians = isLive
    ? {
        static: medianOf(assets.filter((a) => a.format === "static").map((a) => a.score)),
        video: medianOf(assets.filter((a) => a.format === "video").map((a) => a.score)),
      }
    : MEDIAN_BY_FORMAT;

  const getPercentile = (asset: (typeof assets)[number]) =>
    isLive ? percentileWithin(asset.score, asset.format, assets) : getFixturePercentile(asset);

  const gridAssets = assets.slice(0, GRID_COUNT);
  const overflowAssets = assets.slice(GRID_COUNT);

  return (
    <div className="ws-page-in grid grid-cols-1 gap-[26px] lg:grid-cols-[1fr_340px]" style={{ padding: "26px 22px" }}>
      {/* Left column */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-[16px]">
          <div>
            <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
              Library
            </h1>
            <p className="mt-2 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
              {assets.length} assets · statics median {medians.static} · videos median {medians.video}
            </p>
          </div>
          <div className="flex items-center gap-[9px]">
            <button type="button" className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium" style={{ padding: "9px 12px" }}>
              Score ▾
            </button>
            <button type="button" className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium" style={{ padding: "9px 12px" }}>
              Filters · 2
            </button>
            <Link
              href="/signal/analyze"
              className="ws-btn-primary rounded-[7px] text-[12.5px] font-semibold"
              style={{ padding: "9px 12px" }}
            >
              + Analyze
            </Link>
          </div>
        </div>

        <div className="mt-[18px] grid grid-cols-2 gap-[16px] sm:grid-cols-4">
          {gridAssets.map((asset) => {
            const hasReport = isLive || asset.criteria.length > 0;
            const card = (
              <>
                <Thumb aspectRatio="auto" radius={10} style={{ height: 190 }}>
                  <div className="absolute left-[10px] top-[10px]" style={{ zIndex: 2 }}>
                    <ScoreBadge score={asset.score} format={asset.format} />
                  </div>
                  {asset.issuePill && (
                    <div className="absolute bottom-[10px] left-[10px]" style={{ zIndex: 2 }}>
                      <IssuePill>{asset.issuePill}</IssuePill>
                    </div>
                  )}
                </Thumb>
                <div className="mt-[10px]">
                  <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {asset.filename}
                  </p>
                  <p className="mt-[3px] text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                    {asset.postedAt} ·{" "}
                    {(() => {
                      const pct = getPercentile(asset);
                      return pct === null ? `first ${asset.format}` : `${pct}${ordinalSuffix(pct)} of ${asset.format}s`;
                    })()}
                  </p>
                </div>
              </>
            );
            return hasReport ? (
              <Link key={asset.id} href={`/signal/report/${asset.id}`} className="block">
                {card}
              </Link>
            ) : (
              <div key={asset.id}>{card}</div>
            );
          })}
        </div>

        {overflowAssets.length > 0 && (
          <div className="ws-stack mt-[18px]">
            <div
              className="grid items-center"
              style={{
                gridTemplateColumns: "1fr 140px 70px 90px 110px",
                gap: 14,
                padding: "11px 16px",
                background: "var(--ws-surface-header)",
              }}
            >
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>ASSET</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>FORMAT</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>SCORE</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>PERCENTILE</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>FAILED CHECKS</span>
            </div>
            {overflowAssets.map((asset) => {
              const hasReport = isLive || asset.criteria.length > 0;
              const row = (
                <div
                  className="ws-row-hover grid items-center"
                  style={{ gridTemplateColumns: "1fr 140px 70px 90px 110px", gap: 14, padding: "13px 16px" }}
                >
                  <span className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {asset.filename}
                  </span>
                  <span className="text-[11.5px]" style={{ color: "var(--ws-ink-60)" }}>
                    {asset.format === "static" ? "Static · 7 criteria" : "Video · 16 criteria"}
                  </span>
                  <span className="ws-tabular text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {asset.score} / {asset.format}
                  </span>
                  <span className="ws-tabular text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                    {(() => {
                      const pct = getPercentile(asset);
                      return pct === null ? "—" : `${pct}${ordinalSuffix(pct)}`;
                    })()}
                  </span>
                  <span
                    className="ws-tabular text-[12.5px]"
                    style={{
                      color: asset.failedChecks > 5 ? "var(--ws-warn-text)" : "var(--ws-ink-60)",
                      fontWeight: asset.failedChecks > 5 ? 600 : 500,
                    }}
                  >
                    {asset.failedChecks}
                  </span>
                </div>
              );
              return hasReport ? (
                <Link key={asset.id} href={`/signal/report/${asset.id}`}>
                  {row}
                </Link>
              ) : (
                <div key={asset.id}>{row}</div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-[14px]">
        <div
          className="flex flex-col items-center rounded-[12px] text-center"
          style={{
            padding: "28px 20px",
            border: "1.5px dashed color-mix(in srgb, var(--ws-accent) 50%, transparent)",
            background: "var(--ws-surface)",
          }}
        >
          <div
            className="flex h-[48px] w-[48px] items-center justify-center rounded-[12px]"
            style={{ background: "var(--ws-accent-tint)", color: "var(--ws-accent-text)", fontSize: 20 }}
          >
            ↑
          </div>
          <p className="mt-[14px] text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            Drop an asset to analyze
          </p>
          <p className="mt-[4px] text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
            Static or video · up to 500 MB
          </p>
          <Link
            href="/signal/analyze"
            className="ws-btn-primary mt-[16px] rounded-[7px] text-[12.5px] font-semibold"
            style={{ padding: "9px 14px" }}
          >
            Choose a file
          </Link>
        </div>

        <AppearanceCard />

        <div className="rounded-[10px]" style={{ padding: "18px 18px 20px", background: "var(--ws-warn-tint)" }}>
          <p className="ws-eyebrow" style={{ color: "var(--ws-warn-text)" }}>
            ACROSS THE ACCOUNT
          </p>
          <p className="mt-[10px] text-[12.5px] leading-[1.5]" style={{ color: "var(--ws-warn-tint-ink)" }}>
            {ACCOUNT_PATTERN.finding}
          </p>
          <Link
            href="/signal/benchmarks"
            className="mt-[10px] inline-block text-[11.5px] font-medium"
            style={{ color: "var(--ws-warn-text)" }}
          >
            See the pattern →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ordinalSuffix(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}
