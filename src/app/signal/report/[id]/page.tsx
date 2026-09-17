import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAsset,
  getFullCriteria,
  getPercentile as getFixturePercentile,
  MEDIAN_BY_FORMAT,
  VIDEO_FINDINGS,
  VIDEO_TOP_FIX,
  STATIC_FINDINGS,
  STATIC_TOP_FIX,
} from "../../data";
import { getAssetDetail, getLibrary, medianOf, percentileWithin } from "../../live-data";
import { VideoReport } from "./video-report";
import { StaticReport } from "./static-report";

export async function generateMetadata(props: PageProps<"/signal/report/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const live = await getAssetDetail(id);
  const asset = live?.asset ?? getAsset(id);
  return {
    title: asset ? `${asset.score} — Signal` : "Report — Signal",
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage(props: PageProps<"/signal/report/[id]">) {
  const { id } = await props.params;

  const live = await getAssetDetail(id);
  if (live) {
    const library = await getLibrary();
    const median = medianOf(library.assets.filter((a) => a.format === live.asset.format).map((a) => a.score));
    const percentile = percentileWithin(live.asset.score, live.asset.format, library.assets);

    if (live.asset.format === "video") {
      return (
        <VideoReport
          asset={live.asset}
          criteria={live.criteria}
          findings={live.findings as import("../../data").VideoFinding[]}
          topFix={live.topFix}
          median={median}
          percentile={percentile}
          assetUrl={live.assetUrl}
          durationSeconds={live.durationSeconds}
        />
      );
    }
    return (
      <StaticReport
        asset={live.asset}
        criteria={live.criteria}
        findings={live.findings as import("../../data").StaticFinding[]}
        topFix={live.topFix}
        median={median}
        percentile={percentile}
        assetUrl={live.assetUrl}
      />
    );
  }

  // Fall back to the fixture examples — lets the two canonical reports stay
  // browsable before Signal's pipeline is configured (or for either of the
  // two seeded demo ids specifically).
  const asset = getAsset(id);
  if (!asset) notFound();

  const criteria = getFullCriteria(id);
  if (criteria.length === 0) notFound();

  const percentile = getFixturePercentile(asset);

  if (asset.format === "video") {
    return (
      <VideoReport
        asset={asset}
        criteria={criteria}
        findings={VIDEO_FINDINGS}
        topFix={VIDEO_TOP_FIX}
        median={MEDIAN_BY_FORMAT.video}
        percentile={percentile}
        assetUrl={null}
      />
    );
  }

  return (
    <StaticReport
      asset={asset}
      criteria={criteria}
      findings={STATIC_FINDINGS}
      topFix={STATIC_TOP_FIX}
      median={MEDIAN_BY_FORMAT.static}
      percentile={percentile}
      assetUrl={null}
    />
  );
}
