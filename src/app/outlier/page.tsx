import type { Metadata } from "next";
import Link from "next/link";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import {
  getCreators,
  getPosts,
  getJobs,
  getRecentRepurposes,
  getFavouritePosts,
  getCollections,
  getHookStylePatterns,
  getPostsByHookTag,
} from "./live-data";
import { relativeTime } from "@/lib/relative-time";
import { formatCompact, formatScore } from "./format";
import { pullsPaused } from "./pull-errors";
import { AddCreatorButton, PullHandlesButton, BatchRepurposeButton } from "./creator-actions";
import { OnboardingChecklist } from "./onboarding-checklist";
import { AnnouncementBar, type Announcement } from "@/components/app/announcement";
import { getLatestChangelogEntry } from "@/lib/changelog";
import { Alert, AppMain, Avatar, Button, Card, CardHead, PageHeader, StatsRow, appStyles as s } from "@/components/app/ui";
import { PostCard, PostGrid } from "@/components/app/media";

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

// Picked from real usage, most-relevant-first — never a fabricated
// "try this" for a feature the data shows they wouldn't need. Only ever
// returns one at a time so the home page doesn't accumulate nags.
function nextStepTip({
  hasAnalyzedAny,
  hasRepurposed,
  favouritesCount,
  hasCollections,
}: {
  hasAnalyzedAny: boolean;
  hasRepurposed: boolean;
  favouritesCount: number;
  hasCollections: boolean;
}): Announcement | null {
  if (!hasAnalyzedAny) return null; // still onboarding — the checklist already covers this
  if (!hasRepurposed) {
    return {
      id: "tip-try-repurpose",
      label: "Tip",
      text: "You've analyzed a post — turn its hook into an original script for your own content.",
      href: "/outlier/feed",
      cta: "Find a post to repurpose",
    };
  }
  if (favouritesCount >= 3 && !hasCollections) {
    return {
      id: "tip-try-collections",
      label: "Tip",
      text: `You have ${favouritesCount} favourites saved — group them into a named collection to find them faster later.`,
      href: "/outlier/favourites",
      cta: "Create a collection",
    };
  }
  return null;
}

export default async function OutlierHomePage() {
  const [user, creators, posts, { jobs, finished }, recentRepurposes, favouritePosts, collections, hookPatterns] = await Promise.all([
    getUser(),
    getCreators(),
    getPosts(),
    getJobs(),
    getRecentRepurposes(),
    getFavouritePosts(),
    getCollections(),
    getHookStylePatterns(),
  ]);
  const topPattern = hookPatterns.find((p) => p.creatorCount >= 3) ?? null;
  const topPatternPosts = topPattern ? await getPostsByHookTag(topPattern.tag) : [];
  const firstName = getDisplayName(user).split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const creatorById = new Map(creators.map((c) => [c.id, c]));
  const allHandles = creators.flatMap((c) => c.handles);
  const topOutliers = posts.slice(0, 4);
  const runningJobs = jobs.filter((job) => job.state === "running");
  const thinCreators = creators.filter((creator) => creator.handles.some((h) => h.thin));
  const hasPosts = posts.length > 0;
  const best = hasPosts ? posts.reduce((b, post) => (post.score > b.score ? post : b), posts[0]) : null;
  const outlierPosts = posts.filter((post) => post.score >= 2);
  const paused = pullsPaused(jobs, finished[0]?.finishedAtIso ?? null);

  const latest = getLatestChangelogEntry();
  const tip = nextStepTip({
    hasAnalyzedAny: posts.some((p) => p.analysisStatus === "done"),
    hasRepurposed: recentRepurposes.length > 0,
    favouritesCount: favouritePosts.length,
    hasCollections: collections.length > 0,
  });
  const announcements: Announcement[] = [
    { id: latest.id, label: "New", text: latest.summary, href: latest.href, cta: latest.cta },
    ...(tip ? [tip] : []),
  ];

  if (creators.length === 0) {
    return (
      <AppMain>
        <PageHeader eyebrow={`01 / Home · ${today}`} line1={`${greeting()},`} line2={`${firstName}.`} sub="Nothing pulled yet." />
        <div style={{ maxWidth: 560 }}>
          <OnboardingChecklist creators={creators} posts={posts} />
        </div>
      </AppMain>
    );
  }

  const bestHandle = best ? creatorById.get(best.creatorId)?.handles.find((h) => h.platform === best.platform)?.handle : null;

  return (
    <AppMain>
      <PageHeader
        eyebrow={`01 / Home · ${today}`}
        line1={`${greeting()},`}
        line2={`${firstName}.`}
        sub={hasPosts ? `${outlierPosts.length} outliers across ${posts.length} posts from ${creators.length} creator${creators.length === 1 ? "" : "s"}.` : "Nothing pulled yet."}
        actions={
          <>
            <AddCreatorButton variant="ghost" />
            <PullHandlesButton handles={allHandles} variant="primary" icon="refresh" />
          </>
        }
      />

      <OnboardingChecklist creators={creators} posts={posts} />
      <AnnouncementBar items={announcements} />

      {paused && (
        <Alert
          compact
          actions={
            <Button variant="ghost" size="sm" href="/outlier/progress">
              See what failed
            </Button>
          }
        >
          <span>
            <b style={{ color: "var(--ws-ink)", fontSize: 14 }}>Pulls are paused.</b>{" "}
            {paused.kind === "limit" ? "Apify’s monthly usage limit was reached" : "Apify rejected your token"} — {paused.jobs.length} pull{paused.jobs.length === 1 ? "" : "s"} failed.
          </span>
        </Alert>
      )}

      <StatsRow
        stats={[
          { label: "Outliers", value: outlierPosts.length, note: "score ≥ 2×" },
          { label: "Best score", value: best ? formatScore(best.score) : "—", note: bestHandle ? `@${bestHandle}` : "no posts yet", accent: true },
          { label: "Posts pulled", value: posts.length, note: `across ${creators.length} creator${creators.length === 1 ? "" : "s"}` },
          { label: "Needs attention", value: thinCreators.length, note: "thin history" },
        ]}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
        <div style={{ flex: "3 1 840px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <CardHead
              label="Today’s top outliers"
              right={
                hasPosts && (
                  <Link href="/outlier/feed" className={s.cardLink}>
                    All {posts.length} in Feed →
                  </Link>
                )
              }
            />
            {hasPosts ? (
              <PostGrid cols={4}>
                {topOutliers.map((post, i) => {
                  const creator = creatorById.get(post.creatorId);
                  const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle ?? "";
                  return (
                    <PostCard
                      key={post.id}
                      href={`/outlier/video/${post.id}`}
                      ring={i === 0}
                      tile={{ src: post.thumbnailUrl, platform: post.platform, score: formatScore(post.score), scoreAccent: post.score >= 2, height: 270, emoji: "🎬" }}
                      creator={{ initials: creator?.initials ?? "?", handle, avatarUrl: creator?.avatarUrl }}
                      date={post.postedAt}
                      caption={post.caption}
                      views={formatCompact(post.views)}
                      engagement={`${post.engagement.toFixed(1)}%`}
                      hook={post.hookTags[0]}
                    />
                  );
                })}
              </PostGrid>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", textAlign: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>No posts pulled yet</span>
                <span style={{ fontSize: 14, color: "var(--ws-ink-45)" }}>Pull your watchlist to start scoring posts against each creator’s own median.</span>
                <PullHandlesButton handles={allHandles} variant="primary" icon="refresh" />
              </div>
            )}
          </Card>
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {topPattern && (
            <Card paper ring>
              <CardHead label="Pattern worth taking" paper />
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>
                “{topPattern.tag}” beat the median for all {topPattern.creatorCount} creators who used it, averaging {topPattern.avgScore.toFixed(1)}×.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <BatchRepurposeButton posts={topPatternPosts} variant="ink" />
                <Button variant="ghost" size="sm" href="/outlier/trends" style={{ color: "#0b0b0a", borderColor: "#b9b6ae" }}>
                  See in Trends
                </Button>
              </div>
            </Card>
          )}

          <Card>
            <CardHead
              label="Processing now"
              right={
                <Link href="/outlier/progress" className={s.cardLink}>
                  Progress →
                </Link>
              }
            />
            {runningJobs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {runningJobs.map((job) => (
                  <div key={job.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      @{job.handle} · {job.scope}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>{job.stage}</span>
                    <div className="ws-progress-indeterminate" style={{ height: 4, borderRadius: 2, background: "var(--ws-hairline)" }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--ws-surface-header)", borderRadius: 14, padding: 16 }}>
                <span className={s.emo} style={{ fontSize: 20 }} aria-hidden="true">
                  {paused ? "⏸️" : "💤"}
                </span>
                <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>
                  {paused ? "Nothing running — pulls are paused until the Apify limit resets." : "Nothing running right now."}
                </span>
              </div>
            )}
          </Card>

          {thinCreators.length > 0 && (
            <Card>
              <CardHead label="Needs attention" />
              {thinCreators.map((creator) => {
                const thinHandle = creator.handles.find((h) => h.thin)!;
                return (
                  <div key={creator.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar initials={creator.initials} src={creator.avatarUrl} size={36} />
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{creator.displayName}</span>
                      <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>{thinHandle.postCount} posts — median not reliable yet</span>
                    </div>
                    <PullHandlesButton handles={[thinHandle]} variant="ghost" size="sm">
                      Pull more
                    </PullHandlesButton>
                  </div>
                );
              })}
            </Card>
          )}

          {recentRepurposes.length > 0 && (
            <Card>
              <CardHead label="Your recent repurposes" />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recentRepurposes.map((item) => {
                  const creator = creatorById.get(item.creatorId);
                  return (
                    <Link key={item.id} href={`/outlier/repurpose/${item.id}`} style={{ display: "flex", flexDirection: "column", gap: 3, padding: "8px 0" }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</span>
                      <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>
                        from {creator?.handles[0].handle ?? "a tracked creator"} · {item.sourceScore.toFixed(1)}× · {relativeTime(item.createdAtIso)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppMain>
  );
}
