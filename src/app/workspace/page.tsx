import type { Metadata } from "next";
import Link from "next/link";
import { getCreators, getPosts, getJobs } from "@/app/outlier/live-data";
import { getLibrary } from "@/app/signal/live-data";
import { AddCreatorButton } from "@/app/outlier/creator-actions";
import { EmptyState } from "@/components/ws-empty-state";
import { OutlierMark, SignalMark } from "@/components/product-icons";
import { TodayPanel, type TodayInsight } from "./today-panel";
import { ProductCardFrame, OutlierSpikeChart, SignalSplitBar } from "./product-card";
import { RecentActivity, type ActivityItem } from "./recent-activity";

export const metadata: Metadata = {
  title: "Workspace — Creos Labs",
  robots: { index: false, follow: false },
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isWithinLastWeek(iso: string) {
  return Date.now() - new Date(iso).getTime() < SEVEN_DAYS_MS;
}

export default async function OverviewPage() {
  const [creators, posts, { jobs, finished }, library] = await Promise.all([
    getCreators(),
    getPosts(),
    getJobs(),
    getLibrary(),
  ]);

  const creatorById = new Map(creators.map((c) => [c.id, c]));
  const outlierPosts = posts.filter((p) => p.score >= 2);
  const runningJobs = jobs.filter((j) => j.state === "running");
  const isSyncing = runningJobs.length > 0;

  const recentOutliers = outlierPosts.filter((p) => isWithinLastWeek(p.createdAtIso));
  const highestScore = outlierPosts.length > 0 ? Math.max(...outlierPosts.map((p) => p.score)) : null;

  const recentScores = [...posts]
    .sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime())
    .slice(0, 10)
    .reverse()
    .map((p) => p.score);

  const assets = library.assets;
  const assetsFailing = assets.filter((a) => a.failedChecks > 0).length;
  const avgSignalScore = assets.length > 0 ? Math.round(assets.reduce((sum, a) => sum + a.score, 0) / assets.length) : null;

  // ---- Today: real, computed insights only — nothing here is invented. ----
  const insights: TodayInsight[] = [];
  if (recentOutliers.length > 0) {
    insights.push({
      id: "outlier-new",
      text: `${recentOutliers.length} new outlier${recentOutliers.length === 1 ? "" : "s"} this week`,
      meta: highestScore !== null ? `Highest: ${highestScore.toFixed(1)}× baseline` : undefined,
      href: "/outlier/feed",
    });
  }
  if (assetsFailing > 0) {
    insights.push({
      id: "signal-attention",
      text: `${assetsFailing} creative${assetsFailing === 1 ? "" : "s"} need attention`,
      meta: `${assets.length} analysed total`,
      href: "/signal",
    });
  }
  const recentPulls = finished.filter((f) => isWithinLastWeek(f.finishedAtIso));
  const recentPulledPosts = recentPulls.reduce((sum, f) => sum + f.newPostsCount, 0);
  if (recentPulledPosts > 0) {
    insights.push({
      id: "outlier-pulled",
      text: `${recentPulledPosts} new post${recentPulledPosts === 1 ? "" : "s"} pulled this week`,
      href: "/outlier/feed",
    });
  }

  const viewAllHref = recentOutliers.length > 0 || recentPulledPosts > 0 ? "/outlier/feed" : "/signal";

  // ---- Recent activity: merged from real, already-timestamped events. ----
  const activity: ActivityItem[] = [];

  for (const post of [...outlierPosts].sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()).slice(0, 3)) {
    const creator = creatorById.get(post.creatorId);
    const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle;
    activity.push({
      id: `post-${post.id}`,
      icon: <OutlierMark size={14} />,
      accentColor: "var(--ws-accent-text)",
      text: `New ${post.score.toFixed(1)}× outlier detected`,
      meta: handle ? `@${handle}` : "Outlier",
      timestampIso: post.createdAtIso,
      href: `/outlier/video/${post.id}`,
    });
  }

  for (const job of finished.filter((f) => f.newPostsCount > 0).slice(0, 3)) {
    activity.push({
      id: `job-${job.creatorId}-${job.finishedAtIso}`,
      icon: <OutlierMark size={14} />,
      accentColor: "var(--ws-accent-text)",
      text: `${job.newPostsCount} new post${job.newPostsCount === 1 ? "" : "s"} pulled`,
      meta: `@${job.handle}`,
      timestampIso: job.finishedAtIso,
      href: job.creatorId ? `/outlier/creators/${job.creatorId}` : "/outlier/creators",
    });
  }

  for (const asset of [...assets].sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()).slice(0, 3)) {
    activity.push({
      id: `asset-${asset.id}`,
      icon: <SignalMark size={14} />,
      accentColor: "#8b5cf6",
      text: asset.failedChecks > 0 ? `${asset.filename} flagged ${asset.failedChecks} issue${asset.failedChecks === 1 ? "" : "s"}` : `${asset.filename} scored ${Math.round(asset.score)}`,
      meta: asset.platform,
      timestampIso: asset.createdAtIso,
      href: `/signal/report/${asset.id}`,
    });
  }

  const primaryOutlierAction = (
    <AddCreatorButton className="ws-btn-ghost rounded-[7px] text-[12px] font-semibold" style={{ padding: "8px 12px" }}>
      + Track creator
    </AddCreatorButton>
  );
  const emptyOutlierAction = (
    <AddCreatorButton className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "9px 14px" }}>
      Track a creator →
    </AddCreatorButton>
  );
  const primarySignalAction = (
    <Link
      href="/signal/analyze"
      className="ws-btn-ghost rounded-[7px] text-[12px] font-semibold"
      style={{ padding: "8px 12px" }}
    >
      + Analyse creative
    </Link>
  );
  const emptySignalAction = (
    <Link href="/signal/analyze" className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "9px 14px" }}>
      Upload creative →
    </Link>
  );

  return (
    <div className="ws-page-in px-6 py-[26px]">
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
          Workspace
        </h1>
        <p className="mt-[6px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
          Your tools, activity and insights in one place.
        </p>
      </div>

      <div className="flex flex-col gap-[22px]">
        <TodayPanel insights={insights} viewAllHref={viewAllHref} />

        <div>
          <p className="ws-eyebrow" style={{ marginBottom: 14 }}>
            Your tools
          </p>
          <div
            className="grid gap-[14px]"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
          >
            <ProductCardFrame
              icon={<OutlierMark size={18} />}
              name="Outlier"
              eyebrow="Content intelligence"
              accentColor="var(--ws-accent)"
              status={{ label: "Live", color: "var(--ws-accent-text)" }}
              openHref="/outlier"
              primaryAction={creators.length === 0 ? null : primaryOutlierAction}
            >
              {creators.length === 0 ? (
                <EmptyState
                  title="Find your first outlier."
                  description="Track a creator or account you want to learn from."
                  action={emptyOutlierAction}
                />
              ) : (
                <>
                  {isSyncing && (
                    <p className="mb-[10px] text-[11.5px] font-medium" style={{ color: "var(--ws-accent-text)" }}>
                      <span className="live-dot" style={{ color: "var(--ws-accent-text)", marginRight: 6 }} />
                      Syncing new posts…
                    </p>
                  )}
                  <p className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
                    {outlierPosts.length} outlier{outlierPosts.length === 1 ? "" : "s"} found
                  </p>
                  {recentOutliers.length > 0 && (
                    <p className="mt-[2px] text-[12px] font-medium" style={{ color: "var(--ws-accent-text)" }}>
                      +{recentOutliers.length} this week
                    </p>
                  )}
                  <div className="mt-[14px]">
                    <OutlierSpikeChart
                      values={recentScores}
                      peakLabel={highestScore !== null ? `${highestScore.toFixed(1)}×` : null}
                    />
                  </div>
                  <p className="mt-[14px] text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
                    {creators.length} creator{creators.length === 1 ? "" : "s"} · {posts.length} post{posts.length === 1 ? "" : "s"} analysed
                  </p>
                </>
              )}
            </ProductCardFrame>

            <ProductCardFrame
              icon={<SignalMark size={18} />}
              name="Signal"
              eyebrow="Creative analysis"
              accentColor="#8b5cf6"
              status={{ label: "Live", color: "var(--ws-accent-text)" }}
              openHref="/signal"
              primaryAction={assets.length === 0 ? null : primarySignalAction}
            >
              {assets.length === 0 ? (
                <EmptyState
                  title="Analyse your first creative."
                  description="Upload an image or video to see where your creative is strong and where it could improve."
                  action={emptySignalAction}
                />
              ) : (
                <>
                  <div className="flex items-baseline gap-[6px]">
                    <span className="text-[34px] font-bold tracking-[-0.03em]" style={{ color: "var(--ws-ink)" }}>
                      {avgSignalScore}
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: "var(--ws-ink-45)" }}>
                      /100 avg
                    </span>
                  </div>
                  <div className="mt-[14px]">
                    <SignalSplitBar total={assets.length} flagged={assetsFailing} />
                  </div>
                  <p className="mt-[14px] text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
                    {assets.length} analysed
                    {assetsFailing > 0 ? ` · ${assetsFailing} need attention` : ""}
                  </p>
                </>
              )}
            </ProductCardFrame>
          </div>
        </div>

        <RecentActivity items={activity} />

        <div
          className="flex flex-wrap items-center gap-[10px] rounded-[10px]"
          style={{ padding: "13px 16px", background: "var(--ws-surface-header)" }}
        >
          <span className="text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
            No active plan yet
          </span>
          <div className="flex-1" />
          <Link href="/workspace/billing" className="text-[12.5px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            Choose a plan →
          </Link>
        </div>
      </div>
    </div>
  );
}
