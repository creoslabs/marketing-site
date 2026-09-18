import type { Metadata } from "next";
import Link from "next/link";
import type { Asset } from "./data";
import { ASSETS, MEDIAN_BY_FORMAT, getPercentile as getFixturePercentile, ACCOUNT_PATTERN } from "./data";
import { getLibrary, medianOf, percentileWithin } from "./live-data";
import { ScoreBadge, IssuePill, Thumb } from "./components";
import { AppearanceCard } from "./appearance-card";

export const metadata: Metadata = {
  title: "Library — Signal",
  robots: { index: false, follow: false },
};

function ordinalSuffix(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function AssetCard({
  asset,
  hasReport,
  percentile,
}: {
  asset: Asset;
  hasReport: boolean;
  percentile: number | null;
}) {
  const card = (
    <>
      <div className="group">
        <Thumb
          aspectRatio={asset.format === "video" ? "9/16" : "4/5"}
          radius={10}
          style={{ border: "1px solid var(--ws-hairline)", transition: "border-color 0.15s ease" }}
          className="group-hover:[border-color:var(--ws-hairline-strong)]"
        >
          {asset.assetUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- a signed Supabase Storage URL, not a static asset next/image can optimize
            <img
              src={asset.assetUrl}
              alt={asset.filename}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          )}
          {asset.assetUrl && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[64px]"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.45), transparent)" }}
            />
          )}
          <div className="absolute left-[10px] top-[10px]" style={{ zIndex: 2 }}>
            <ScoreBadge score={asset.score} format={asset.format} />
          </div>
          {asset.issuePill && (
            <div className="absolute bottom-[10px] left-[10px]" style={{ zIndex: 2 }}>
              <IssuePill>{asset.issuePill}</IssuePill>
            </div>
          )}
        </Thumb>
      </div>
      <div className="mt-[10px]">
        <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
          {asset.filename}
        </p>
        <p className="mt-[3px] text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
          {asset.postedAt} ·{" "}
          {percentile === null ? `first ${asset.format}` : `${percentile}${ordinalSuffix(percentile)} of ${asset.format}s`}
        </p>
      </div>
    </>
  );

  return hasReport ? (
    <Link href={`/signal/report/${asset.id}`} className="block">
      {card}
    </Link>
  ) : (
    <div>{card}</div>
  );
}

function AssetSection({
  title,
  assets,
  median,
  isLive,
  getPercentile,
}: {
  title: string;
  assets: Asset[];
  median: number;
  isLive: boolean;
  getPercentile: (asset: Asset) => number | null;
}) {
  if (assets.length === 0) return null;
  return (
    <div className="mt-[24px] first:mt-[18px]">
      <div className="flex items-baseline gap-[10px]">
        <p className="ws-eyebrow">{title}</p>
        <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
          {assets.length} · median {median}
        </span>
      </div>
      <div
        className="mt-[12px] grid items-start gap-[14px]"
        style={{ gridTemplateColumns: "repeat(auto-fill, 110px)" }}
      >
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            hasReport={isLive || asset.criteria.length > 0}
            percentile={getPercentile(asset)}
          />
        ))}
      </div>
    </div>
  );
}

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

  const getPercentile = (asset: Asset) =>
    isLive ? percentileWithin(asset.score, asset.format, assets) : getFixturePercentile(asset);

  const videoAssets = assets.filter((a) => a.format === "video");
  const staticAssets = assets.filter((a) => a.format === "static");

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

        <AssetSection
          title="VIDEOS"
          assets={videoAssets}
          median={medians.video}
          isLive={isLive}
          getPercentile={getPercentile}
        />
        <AssetSection
          title="STATICS"
          assets={staticAssets}
          median={medians.static}
          isLive={isLive}
          getPercentile={getPercentile}
        />
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
