import type { Metadata } from "next";
import Link from "next/link";
import type { Asset } from "../data";
import { getLibrary, medianOf, percentileWithin, computeScoreTrend, getFailureThemes } from "../live-data";
import { ScoreBadge } from "../components";
import { EmptyState } from "@/components/ws-empty-state";

const PLATFORM_SHORT: Record<Asset["platform"], string> = { TikTok: "TT", Instagram: "IG" };

export const metadata: Metadata = {
  title: "Benchmarks — Signal",
  robots: { index: false, follow: false },
};

function FormatColumn({
  title,
  assets,
  median,
  platformMedians,
  trend,
}: {
  title: string;
  assets: Asset[];
  median: number;
  platformMedians: { platform: Asset["platform"]; median: number }[];
  trend: number | null;
}) {
  const sorted = [...assets].sort((a, b) => b.score - a.score);
  const max = Math.max(...sorted.map((a) => a.score), 1);

  return (
    <div className="ws-card" style={{ padding: "18px 20px 20px" }}>
      <div className="flex items-center">
        <p className="ws-eyebrow">{title}</p>
        <div className="flex-1" />
        {trend !== null && (
          <span
            className="ws-tabular mr-[10px] text-[11.5px] font-medium"
            style={{ color: trend >= 0 ? "var(--ws-accent-text)" : "var(--ws-warn-text)" }}
          >
            {trend >= 0 ? "+" : ""}
            {trend}% vs earlier
          </span>
        )}
        <span className="ws-tabular text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
          median {median}
        </span>
      </div>

      {platformMedians.length > 1 && (
        <p className="mt-[4px] text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
          {platformMedians.map((p, i) => (
            <span key={p.platform}>
              {i > 0 && " · "}
              {p.platform} median {p.median}
            </span>
          ))}
        </p>
      )}

      {sorted.length === 0 ? (
        <EmptyState title="Nothing analyzed in this format yet" />
      ) : (
        <div className="mt-[14px] flex flex-col gap-[10px]">
          {sorted.map((asset) => (
            <Link key={asset.id} href={`/signal/report/${asset.id}`} className="flex items-center gap-[10px]">
              <span
                className="shrink-0 rounded-[4px] text-[9.5px] font-semibold uppercase"
                style={{ padding: "2px 5px", background: "var(--ws-surface-header)", color: "var(--ws-ink-45)" }}
              >
                {PLATFORM_SHORT[asset.platform]}
              </span>
              <span className="w-[110px] shrink-0 truncate text-[11.5px]" style={{ color: "var(--ws-ink-60)" }}>
                {asset.filename}
              </span>
              <div className="h-[6px] flex-1 overflow-hidden rounded-[3px]" style={{ background: "var(--ws-hairline)" }}>
                <div
                  className="h-full rounded-[3px]"
                  style={{
                    width: `${(asset.score / max) * 100}%`,
                    background: asset.score >= median ? "var(--ws-accent)" : "var(--ws-ink-45)",
                  }}
                />
              </div>
              <span className="ws-tabular w-[28px] shrink-0 text-right text-[11.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                {asset.score}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// assets arrives most-recent-first (getLibrary orders by created_at desc),
// which is exactly the order computeScoreTrend needs.
function platformMediansFor(assets: Asset[]) {
  const platforms = [...new Set(assets.map((a) => a.platform))];
  return platforms.map((platform) => ({
    platform,
    median: medianOf(assets.filter((a) => a.platform === platform).map((a) => a.score)),
  }));
}

export default async function BenchmarksPage() {
  const [live, failureThemes] = await Promise.all([getLibrary(), getFailureThemes()]);
  const assets = live.assets;
  const staticAssets = assets.filter((a) => a.format === "static");
  const videoAssets = assets.filter((a) => a.format === "video");
  const medians = {
    static: medianOf(staticAssets.map((a) => a.score)),
    video: medianOf(videoAssets.map((a) => a.score)),
  };
  const trends = {
    static: computeScoreTrend(staticAssets.map((a) => a.score)),
    video: computeScoreTrend(videoAssets.map((a) => a.score)),
  };
  const example = staticAssets[0];

  return (
    <div className="ws-page-in" style={{ padding: "26px 22px" }}>
      <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
        Benchmarks
      </h1>
      <p className="mt-2 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
        Two medians, split by format — a video and a static score are never averaged together. Platform
        medians and a recent-vs-earlier trend show alongside, once there&apos;s enough history to trust them.
      </p>

      <div className="mt-[18px] grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        <FormatColumn
          title="STATIC · SORTED BY SCORE"
          assets={staticAssets}
          median={medians.static}
          platformMedians={platformMediansFor(staticAssets)}
          trend={trends.static}
        />
        <FormatColumn
          title="VIDEO · SORTED BY SCORE"
          assets={videoAssets}
          median={medians.video}
          platformMedians={platformMediansFor(videoAssets)}
          trend={trends.video}
        />
      </div>

      <div
        className="mt-[14px] rounded-[10px]"
        style={{ padding: "18px 20px 20px", border: "1px solid var(--ws-hairline)" }}
      >
        <p className="ws-eyebrow">WHY THESE STAY SEPARATE</p>
        <p className="mt-[10px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
          A video ad and a static ad are scored against different criteria sets — a 70 on video and a 70
          on static aren&apos;t the same claim. Selecting one of each for comparison shows only the
          criteria they share, and says so. It never blends the two into one number.
        </p>
      </div>

      {failureThemes.length > 0 && (
        <div className="ws-card mt-[14px]" style={{ padding: "18px 20px 20px" }}>
          <p className="ws-eyebrow">RECURRING FAILURES ACROSS YOUR LIBRARY</p>
          <p className="mt-[6px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            Criteria that have failed on more than one asset — an exact count, not a fabricated pattern.
          </p>
          <div className="mt-[14px] flex flex-col gap-[8px]">
            {failureThemes.map((theme) => (
              <div key={theme.name} className="flex items-center gap-[10px]">
                <span className="min-w-0 flex-1 truncate text-[12.5px]" style={{ color: "var(--ws-ink)" }}>
                  {theme.name}
                </span>
                <span
                  className="rounded-[4px] text-[9.5px] font-semibold uppercase"
                  style={{ padding: "2px 5px", background: "var(--ws-warn-tint)", color: "var(--ws-warn-text)" }}
                >
                  Tier {theme.tier}
                </span>
                <span className="ws-tabular shrink-0 text-[12px] font-medium" style={{ color: "var(--ws-warn-text)" }}>
                  failed {theme.count}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {example && (
        <div className="mt-[14px] flex items-center gap-[12px]" style={{ padding: "4px 2px" }}>
          <ScoreBadge score={example.score} format={example.format} />
          <p className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            Example: {example.filename} ranks{" "}
            {(() => {
              const p = percentileWithin(example.score, example.format, assets);
              return p === null ? "first" : `${p}th percentile`;
            })()}{" "}
            among statics only.
          </p>
        </div>
      )}
    </div>
  );
}
