import type { Metadata } from "next";
import Link from "next/link";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { getCreators, getPosts, getJobs, getRecentRepurposes, getFavouritePosts, getCollections } from "./live-data";
import { relativeTime } from "@/lib/relative-time";
import { Avatar, EmptyState, PlatformBadge, ProgressBar, ScoreChip, StatRow, Thumb } from "./components";
import { AddCreatorButton, PullHandlesButton } from "./creator-actions";
import { OnboardingChecklist } from "./onboarding-checklist";
import { NextStepSuggestion, type Suggestion } from "./next-step-suggestion";
import { WhatsNewCard } from "@/components/whats-new-card";

// Picked from real usage, most-relevant-first — never a fabricated
// "try this" for a feature the data shows they wouldn't need. Only ever
// returns one at a time so the home page doesn't accumulate nags.
function computeNextStepSuggestion({
  hasAnalyzedAny,
  hasRepurposed,
  favouritesCount,
  hasCollections,
}: {
  hasAnalyzedAny: boolean;
  hasRepurposed: boolean;
  favouritesCount: number;
  hasCollections: boolean;
}): Suggestion | null {
  if (!hasAnalyzedAny) return null; // still onboarding — the checklist already covers this
  if (!hasRepurposed) {
    return {
      id: "try-repurpose",
      title: "Turn a hook into your own script",
      description: "You've analyzed a post — Outlier can generate an original script modeled on its structure.",
      href: "/outlier/feed",
      cta: "Find a post to repurpose",
    };
  }
  if (favouritesCount >= 3 && !hasCollections) {
    return {
      id: "try-collections",
      title: "Organize your favourites",
      description: `You have ${favouritesCount} favourites saved — group them into a named collection to find them faster later.`,
      href: "/outlier/favourites",
      cta: "Create a collection",
    };
  }
  return null;
}

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
  const [user, creators, posts, { jobs }, recentRepurposes, favouritePosts, collections] = await Promise.all([
    getUser(),
    getCreators(),
    getPosts(),
    getJobs(),
    getRecentRepurposes(),
    getFavouritePosts(),
    getCollections(),
  ]);
  const firstName = getDisplayName(user).split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const creatorById = new Map(creators.map((c) => [c.id, c]));
  const allHandles = creators.flatMap((c) => c.handles);
  // Matches the grid's max column count (lg:grid-cols-4) so this always
  // fills a clean row instead of leaving one card stranded alone on a
  // second, mostly-empty row.
  const topOutliers = posts.slice(0, 4);
  const runningJobs = jobs.filter((job) => job.state === "running");
  const thinCreators = creators.filter((creator) => creator.handles.some((h) => h.thin));
  const hasPosts = posts.length > 0;
  const bestToday = hasPosts ? posts.reduce((best, post) => (post.score > best.score ? post : best), posts[0]) : null;
  const outlierPosts = posts.filter((post) => post.score >= 2);
  const nextStepSuggestion = computeNextStepSuggestion({
    hasAnalyzedAny: posts.some((p) => p.analysisStatus === "done"),
    hasRepurposed: recentRepurposes.length > 0,
    favouritesCount: favouritePosts.length,
    hasCollections: collections.length > 0,
  });

  if (creators.length === 0) {
    return (
      <div className="ws-page-in flex min-h-[70vh] items-center justify-center px-6 py-[22px]">
        <div style={{ maxWidth: 420, width: "100%" }}>
          <OnboardingChecklist creators={creators} posts={posts} />
        </div>
      </div>
    );
  }

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <OnboardingChecklist creators={creators} posts={posts} />
      <WhatsNewCard />
      <NextStepSuggestion suggestion={nextStepSuggestion} />
      <div className="flex flex-wrap items-start justify-between gap-[16px]">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            {greeting()}, {firstName}
          </h1>
          <p className="mt-2 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            {hasPosts ? `${today} · ${outlierPosts.length} outliers across ${posts.length} posts` : `${today} · nothing pulled yet`}
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <AddCreatorButton className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium" style={{ padding: "10px 14px" }}>
            Add creator
          </AddCreatorButton>
          <PullHandlesButton handles={allHandles} />
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
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>BEST SCORE</p>
          <p className="ws-tabular text-[28px] font-medium tracking-[-0.04em]" style={{ color: "var(--ws-ink)" }}>
            {bestToday ? `${bestToday.score.toFixed(1)}×` : "—"}
          </p>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            {bestToday
              ? `@${creatorById.get(bestToday.creatorId)?.handles.find((h) => h.platform === bestToday.platform)?.handle}`
              : "no posts yet"}
          </p>
        </div>
        <div className="flex-1" style={{ padding: "16px 18px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>POSTS PULLED</p>
          <p className="ws-tabular text-[28px] font-medium tracking-[-0.04em]" style={{ color: "var(--ws-ink)" }}>
            {posts.length}
          </p>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            across {creators.length} creators
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
        <div className="ws-card" style={{ padding: "18px 20px 20px" }}>
          <div className="flex items-center">
            <h2 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Today&apos;s top outliers
            </h2>
            <div className="flex-1" />
            {hasPosts && (
              <Link href="/outlier/feed" className="ws-link-accent text-[12px] font-medium">
                All {posts.length} in Feed →
              </Link>
            )}
          </div>

          {hasPosts ? (
            <div className="mt-[14px] grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-4">
              {topOutliers.map((post) => {
                const creator = creatorById.get(post.creatorId);
                const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle ?? "";
                return (
                  <Link key={post.id} href={`/outlier/video/${post.id}`} className="block">
                    <Thumb aspectRatio="9/13" radius={10}>
                      {post.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- a scraped CDN URL, not a static asset next/image can optimize
                        <img
                          src={post.thumbnailUrl}
                          alt={post.caption}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute left-[7px] top-[7px]" style={{ zIndex: 2 }}>
                        <PlatformBadge platform={post.platform} />
                      </div>
                      <div
                        className="absolute inset-x-0 bottom-0"
                        style={{
                          height: 44,
                          background:
                            "linear-gradient(to top, color-mix(in srgb, var(--ws-ground) 70%, transparent), transparent)",
                        }}
                      />
                      <div className="absolute bottom-[7px] left-[7px]" style={{ zIndex: 2 }}>
                        <ScoreChip score={post.score} median={post.median} />
                      </div>
                    </Thumb>
                    <div className="mt-[7px] flex items-center gap-[6px]">
                      {creator && <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={18} />}
                      <span className="truncate text-[11px] font-medium" style={{ color: "var(--ws-ink)" }}>
                        {handle}
                      </span>
                    </div>
                    <div className="mt-[4px]">
                      <StatRow views={post.views} engagement={post.engagement} size="sm" />
                    </div>
                    <p className="mt-[2px] truncate text-[10px]" style={{ color: "var(--ws-ink-45)" }}>
                      {post.postedAt}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No posts pulled yet"
              description="Pull your watchlist to start scoring posts against each creator's own median."
              action={
                <PullHandlesButton
                  handles={allHandles}
                  className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
                  style={{ padding: "9px 14px" }}
                />
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
                  return (
                    <div key={job.id}>
                      <div className="flex items-center">
                        <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                          @{job.handle} · {job.scope}
                        </span>
                        <div className="flex-1" />
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
                      <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={26} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                          {creator.displayName}
                        </p>
                        <p className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                          {thinHandle.postCount} posts — median not reliable yet
                        </p>
                      </div>
                      <PullHandlesButton
                        handles={[thinHandle]}
                        className="ws-btn-ghost shrink-0 rounded-[7px] text-[11.5px] font-medium"
                        style={{ padding: "7px 10px" }}
                      >
                        Pull more
                      </PullHandlesButton>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {recentRepurposes.length > 0 && (
            <div className="ws-card" style={{ padding: "18px 20px 20px" }}>
              <p className="ws-eyebrow">YOUR RECENT REPURPOSES</p>
              <div className="mt-[14px] flex flex-col gap-[12px]">
                {recentRepurposes.map((item) => {
                  const creator = creatorById.get(item.creatorId);
                  return (
                    <Link key={item.id} href={`/outlier/repurpose/${item.id}`} className="ws-row-hover -mx-[6px] block rounded-[8px] px-[6px] py-[4px]">
                      <p className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                        from {creator?.handles[0].handle ?? "a tracked creator"} · {item.sourceScore.toFixed(1)}× ·{" "}
                        {relativeTime(item.createdAtIso)}
                      </p>
                    </Link>
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
