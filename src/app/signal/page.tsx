import type { Metadata } from "next";
import Link from "next/link";
import { getLibrary, medianOf, percentileWithin, getFailureThemes } from "./live-data";
import { LibraryGrid } from "./library-grid";

export const metadata: Metadata = {
  title: "Library — Signal",
  robots: { index: false, follow: false },
};

function countAnalysedThisWeek(assets: { createdAtIso: string }[]) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return assets.filter((a) => new Date(a.createdAtIso).getTime() >= oneWeekAgo).length;
}

export default async function LibraryPage() {
  // Independent reads — fetched together instead of one after another. The
  // extra failureThemes query is wasted in the rare empty-library case below,
  // but that's cheaper than making every normal page load wait for two
  // sequential round-trips.
  const [live, failureThemes] = await Promise.all([getLibrary(), getFailureThemes()]);
  const assets = live.assets;
  const isLive = live.isLive;

  const medians = {
    static: medianOf(assets.filter((a) => a.format === "static").map((a) => a.score)),
    video: medianOf(assets.filter((a) => a.format === "video").map((a) => a.score)),
  };

  if (assets.length === 0) {
    return (
      <div className="ws-page-in flex items-center justify-center" style={{ minHeight: "calc(100vh - 102px)", padding: "26px 22px" }}>
        <div
          className="flex flex-col items-center rounded-[14px] text-center"
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "44px 32px",
            border: "1.5px dashed color-mix(in srgb, var(--ws-accent) 50%, transparent)",
            background: "var(--ws-surface)",
          }}
        >
          <div
            className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
            style={{ background: "var(--ws-accent-tint)", color: "var(--ws-accent-text)", fontSize: 22 }}
          >
            ↑
          </div>
          <p className="mt-[18px] text-[17px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            {isLive ? "Analyze your first asset" : "Signal isn't connected to a database yet"}
          </p>
          <p className="mt-[6px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
            {isLive
              ? "Drop a static or video ad here to get its first best-practice score — up to 500 MB."
              : "Analysis results will show up here once it is."}
          </p>
          <Link href="/signal/analyze" className="ws-btn-primary mt-[20px] rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "10px 16px" }}>
            Choose a file
          </Link>
        </div>
      </div>
    );
  }

  const rows = assets.map((asset) => ({ asset, percentile: percentileWithin(asset.score, asset.format, assets) }));
  const topTheme = failureThemes[0] ?? null;

  const analysedThisWeek = countAnalysedThisWeek(assets);

  return (
    <div className="ws-page-in" style={{ padding: "26px 22px 0" }}>
      <p className="ws-eyebrow">02 / LIBRARY</p>
      <h1
        style={{
          margin: 0,
          marginTop: 22,
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.02,
          textTransform: "uppercase",
          color: "var(--ws-ink)",
        }}
      >
        {assets.length} asset{assets.length === 1 ? "" : "s"} scored.
        {topTheme && (
          <>
            <br />
            <span style={{ color: "var(--ws-headline-grey)" }}>
              {topTheme.count} fail &ldquo;{topTheme.name}.&rdquo;
            </span>
          </>
        )}
      </h1>
      <p className="mt-[14px] max-w-[64ch] text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
        Statics median {medians.static} · videos median {medians.video}. Scores are only comparable within a format.
      </p>

      <div className="mt-[22px] grid grid-cols-1 gap-[26px] lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div>
          <LibraryGrid rows={rows} medians={medians} />
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

          {topTheme && (
            <div className="rounded-[10px]" style={{ padding: "16px 18px 18px", background: "var(--ws-warn-tint)" }}>
              <p className="ws-eyebrow" style={{ color: "var(--ws-warn-text)" }}>
                ACROSS THE ACCOUNT
              </p>
              <p className="mt-[10px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-warn-tint-ink)" }}>
                {topTheme.count} assets fail &ldquo;{topTheme.name}&rdquo; — the most common failing check across your
                library.
              </p>
            </div>
          )}

          <div className="ws-card" style={{ padding: "16px 18px 18px" }}>
            <p className="ws-eyebrow">THIS WEEK</p>
            <div className="mt-[12px] flex flex-col gap-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                  Analysed
                </span>
                <span className="ws-tabular text-[13px] font-semibold" style={{ color: "var(--ws-ink)" }}>
                  {analysedThisWeek} asset{analysedThisWeek === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                  Statics median
                </span>
                <span className="ws-tabular text-[13px] font-semibold" style={{ color: "var(--ws-ink)" }}>
                  {medians.static}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                  Videos median
                </span>
                <span className="ws-tabular text-[13px] font-semibold" style={{ color: "var(--ws-ink)" }}>
                  {medians.video}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
