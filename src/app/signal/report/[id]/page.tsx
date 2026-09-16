import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAsset,
  getFullCriteria,
  getPercentile,
  MEDIAN_BY_FORMAT,
  VIDEO_FINDINGS,
  VIDEO_TOP_FIX,
  STATIC_FINDINGS,
  STATIC_TOP_FIX,
} from "../../data";
import { VideoReport } from "./video-report";
import { StaticReport } from "./static-report";

export async function generateMetadata(props: PageProps<"/signal/report/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const asset = getAsset(id);
  return {
    title: asset ? `${asset.score} — Signal` : "Report — Signal",
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage(props: PageProps<"/signal/report/[id]">) {
  const { id } = await props.params;
  const asset = getAsset(id);
  if (!asset) notFound();

  const criteria = getFullCriteria(id);
  if (criteria.length === 0) notFound();

  const percentile = getPercentile(asset);

  if (asset.format === "video") {
    return (
      <VideoReport
        asset={asset}
        criteria={criteria}
        findings={VIDEO_FINDINGS}
        topFix={VIDEO_TOP_FIX}
        median={MEDIAN_BY_FORMAT.video}
        percentile={percentile}
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
    />
  );
}
