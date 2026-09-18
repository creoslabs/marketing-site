import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssetDetail, getFormatScores, medianOf, percentileWithin } from "../../live-data";
import { VideoReport } from "./video-report";
import { StaticReport } from "./static-report";

export async function generateMetadata(props: PageProps<"/signal/report/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const live = await getAssetDetail(id);
  return {
    title: live ? `${live.asset.score} — Signal` : "Report — Signal",
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage(props: PageProps<"/signal/report/[id]">) {
  const { id } = await props.params;

  // Independent of each other — run together rather than waterfalling.
  const [live, scores] = await Promise.all([getAssetDetail(id), getFormatScores()]);
  if (!live) notFound();

  const median = medianOf(scores.filter((a) => a.format === live.asset.format).map((a) => a.score));
  const percentile = percentileWithin(live.asset.score, live.asset.format, scores);

  if (live.asset.format === "video") {
    return (
      <VideoReport
        asset={live.asset}
        criteria={live.criteria}
        findings={live.findings as import("../../data").VideoFinding[]}
        topFix={live.topFix}
        median={median}
        percentile={percentile}
        frames={live.frames}
        frameDebug={live.frameDebug}
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
