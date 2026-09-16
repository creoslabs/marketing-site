import type { Metadata } from "next";
import Link from "next/link";
import { VIDEO_ASSETS, STATIC_ASSETS, MEDIAN_BY_FORMAT, getPercentile } from "../data";
import { ScoreBadge } from "../components";

export const metadata: Metadata = {
  title: "Benchmarks — Signal",
  robots: { index: false, follow: false },
};

function FormatColumn({ title, assets, median }: { title: string; assets: typeof VIDEO_ASSETS; median: number }) {
  const sorted = [...assets].sort((a, b) => b.score - a.score);
  const max = Math.max(...sorted.map((a) => a.score), 1);

  return (
    <div className="ws-card" style={{ padding: "18px 20px 20px" }}>
      <div className="flex items-center">
        <p className="ws-eyebrow">{title}</p>
        <div className="flex-1" />
        <span className="ws-tabular text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
          median {median}
        </span>
      </div>

      <div className="mt-[14px] flex flex-col gap-[10px]">
        {sorted.map((asset) => (
          <Link
            key={asset.id}
            href={asset.criteria.length > 0 ? `/signal/report/${asset.id}` : "#"}
            className="flex items-center gap-[10px]"
          >
            <span className="w-[130px] shrink-0 truncate text-[11.5px]" style={{ color: "var(--ws-ink-60)" }}>
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
    </div>
  );
}

export default function BenchmarksPage() {
  const eleven = STATIC_ASSETS[0];

  return (
    <div className="ws-page-in" style={{ padding: "26px 22px" }}>
      <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
        Benchmarks
      </h1>
      <p className="mt-2 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
        Two medians, split by format — a video and a static score are never averaged together.
      </p>

      <div className="mt-[18px] grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        <FormatColumn title="STATIC · SORTED BY SCORE" assets={STATIC_ASSETS} median={MEDIAN_BY_FORMAT.static} />
        <FormatColumn title="VIDEO · SORTED BY SCORE" assets={VIDEO_ASSETS} median={MEDIAN_BY_FORMAT.video} />
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

      {eleven && (
        <div className="mt-[14px] flex items-center gap-[12px]" style={{ padding: "4px 2px" }}>
          <ScoreBadge score={eleven.score} format={eleven.format} />
          <p className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            Example: {eleven.filename} ranks {getPercentile(eleven)}th percentile among statics only.
          </p>
        </div>
      )}
    </div>
  );
}
