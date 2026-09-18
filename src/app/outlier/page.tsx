import type { Metadata } from "next";
import Link from "next/link";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import {
  CREATORS,
  POSTS,
  JOBS,
  RECENT_REPURPOSES,
  getCreator,
} from "./data";
import { Avatar, EmptyState, ProgressBar, ScoreChip, Thumb, ThinHistoryPill } from "./components";
import { formatCompact } from "./format";

export const metadata: Metadata = {
  title: "Outlier — Creos Labs",
  robots: { index: false, follow: false },
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function OutlierHomePage() {
  const user = await getUser();
  const firstName = getDisplayName(user).split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const topOutliers = POSTS.slice(0, 5);
  const runningJobs = JOBS.filter((job) => job.state === "running");
  const thinCreators = CREATORS.filter((creator) =>
    creator.handles.some((h) => h.thin)
  );
  const hasPosts = POSTS.length > 0;
  const bestToday = hasPosts
    ? POSTS.reduce((best, post) => (post.score > best.score ? post : best), POSTS[0])
    : null;
  const outlierPosts = POSTS.filter((post) => post.score >= 2);

  if (CREATORS.length === 0) {
    return (
      <div className="ws-page-in flex min-h-[70vh] items-center justify-center px-6 py-[22px]">
        <EmptyState
          size="large"
          title="Add your first creator to get started"
          description="Track a creator's posts and Outlier scores each one against their own median — surfacing the hooks worth repurposing."
          action={
            <button
              type="button"
              className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
              style={{ padding: "11px 16px" }}
            >
              + Add creator
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-[16px]">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            {greeting()}, {firstName}
          </h1>
          <p className="mt-2 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            {hasPosts ? `${today} · ${outlierPosts.length} outliers across ${POSTS.length} posts` : `${today} · nothing pulled yet`}
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <button
            type="button"
            className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
            style={{ padding: "10px 14px" }}
          >
            Add creator
          </button>
          <button
            type="button"
            className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
            style={{ padding: "10px 14px" }}
          >
            Pull now
          </button>
        </div>
      </div>

      <div className="ws-stack-row mt-[18px]">
        <div className="flex-1" style={{ padding: "16px 18px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>OUTLIERS</p>
          <p className="ws-tabular text-[28px] font-medium tracking-[-0.04em]" style={{ color: "var(--ws-ink)" }}>
            {outlierPosts.length}
          </p>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>score ≥ 2×</p>
        </div>
        <div className="flex-1" style={{ padding: "16px 18px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>BEST SCORE TODAY</p>
          <p className="ws-tabular text-[28px] font-medium tracking-[-0.04em]" style={{ color: "var(--ws-ink)" }}>
            {bestToday ? `${bestToday.score.toFixed(1)}×` : "—"}
          </p>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            {bestToday ? `@${getCreator(bestToday.creatorId).handles[0].handle.replace("@", "")}` : "no posts yet"}
          </p>
        </div>
        <div className="flex-1" style={{ padding: "16px 18px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>POSTS PULLED</p>
          <p className="ws-tabular text-[28px] font-medium tracking-[-0.04em]" style={{ color: "var(--ws-ink)" }}>
            {POSTS.length}
          </p>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            across {CREATORS.length} creators
          </p>
        </div>
        <div className="flex-1" style={{ padding: "16px 18px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>NEEDS ATTENTION</p>
          <p className="ws-tabular text-[28px] font-medium tracking-[-0.04em]" style={{ color: "var(--ws-ink)" }}>
            {thinCreators.length}
          </p>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>thin history</p>
        </div>
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_352px]">
        {/* Left column */}
        <div className="ws-card" style={{ padding: "18px 0 6px" }}>
          <div className="flex items-center px-[20px]">
            <h2 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Today&apos;s top outliers
            </h2>
            <div className="flex-1" />
            {hasPosts && (
              <Link href="/outlier/feed" className="ws-link-accent text-[12px] font-medium">
                All {POSTS.length} in Feed →
              </Link>
            )}
          </div>

          {hasPosts ? (
            <div className="ws-stack mt-[14px]" style={{ border: "none", borderRadius: 0 }}>
              {topOutliers.map((post) => {
                const creator = getCreator(post.creatorId);
                const handle = creator.handles[0].handle;
                return (
                  <Link
                    key={post.id}
                    href={`/outlier/video/${post.id}`}
                    className="ws-row-hover flex items-center gap-[14px]"
                    style={{ padding: "12px 20px" }}
                  >
                    <Thumb aspectRatio="44/60" radius={8} style={{ width: 44 }} />
                    <ScoreChip score={post.score} />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13.5px] font-medium"
                        style={{ color: "var(--ws-ink)" }}
                      >
                        {post.caption}
                      </p>
                      <div className="mt-[4px] flex items-center gap-[7px]">
                        <Avatar initials={creator.initials} size={20} />
                        <span className="truncate text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                          {handle} · {formatCompact(post.views)} views · {post.postedAt}
                        </span>
                        {post.thin && <ThinHistoryPill />}
                      </div>
                    </div>
                    <span style={{ color: "var(--ws-ink-45)" }}>→</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No posts pulled yet"
              description="Pull your watchlist to start scoring posts against each creator's own median."
              action={
                <button
                  type="button"
                  className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
                  style={{ padding: "9px 14px" }}
                >
                  Pull now
                </button>
              }
            />
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-[14px]">
          <div className="ws-card" style={{ padding: "18px 20px 20px" }}>
            <div className="flex items-center">
              <p className="ws-eyebrow">PROCESSING NOW</p>
              <div className="flex-1" />
              <Link href="/outlier/progress" className="ws-link-accent text-[11.5px] font-medium">
                Progress →
              </Link>
            </div>
            {runningJobs.length > 0 ? (
              <div className="mt-[14px] flex flex-col gap-[14px]">
                {runningJobs.map((job) => {
                  const creator = getCreator(job.creatorId);
                  return (
                    <div key={job.id}>
                      <div className="flex items-center">
                        <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                          {creator.handles[0].handle} · {job.scope}
                        </span>
                        <div className="flex-1" />
                        <span className="ws-tabular text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                          {job.pct}%
                        </span>
                      </div>
                      <p className="mt-[4px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                        {job.stage}
                      </p>
                      <div className="mt-[8px]">
                        <ProgressBar pct={job.pct} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="Nothing running right now" />
            )}
          </div>

          {thinCreators.length > 0 && (
            <div className="ws-card" style={{ padding: "18px 20px 20px" }}>
              <p className="ws-eyebrow">NEEDS ATTENTION</p>
              <div className="mt-[14px] flex flex-col gap-[14px]">
                {thinCreators.map((creator) => {
                  const thinHandle = creator.handles.find((h) => h.thin)!;
                  return (
                    <div key={creator.id} className="flex items-center gap-[10px]">
                      <Avatar initials={creator.initials} size={26} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                          {creator.displayName}
                        </p>
                        <p className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                          {thinHandle.postCount} posts — median not reliable yet
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ws-btn-ghost shrink-0 rounded-[7px] text-[11.5px] font-medium"
                        style={{ padding: "7px 10px" }}
                      >
                        Pull more
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {RECENT_REPURPOSES.length > 0 && (
            <div className="ws-card" style={{ padding: "18px 20px 20px" }}>
              <p className="ws-eyebrow">YOUR RECENT REPURPOSES</p>
              <div className="mt-[14px] flex flex-col gap-[12px]">
                {RECENT_REPURPOSES.map((item) => {
                  const creator = getCreator(item.creatorId);
                  return (
                    <div key={item.title}>
                      <p className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                        from {creator.handles[0].handle} · {item.score.toFixed(1)}× · {item.relativeTime}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
