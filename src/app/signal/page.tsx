import type { Metadata } from "next";
import Link from "next/link";
import { getLibrary, medianOf, percentileWithin } from "./live-data";
import { LibraryGrid } from "./library-grid";

export const metadata: Metadata = {
  title: "Library — Signal",
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  const live = await getLibrary();
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

  return (
    <div className="ws-page-in grid grid-cols-1 gap-[26px] lg:grid-cols-[1fr_340px]" style={{ padding: "26px 22px" }}>
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
      </div>
    </div>
  );
}
