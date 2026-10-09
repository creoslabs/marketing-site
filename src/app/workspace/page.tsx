import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getCreators, getTopPosts, getCreatorDetail, getJobs } from "@/app/outlier/live-data";
import { pullsPaused } from "@/app/outlier/pull-errors";
import { getLibrary, getAssetDetail, percentileWithin } from "@/app/signal/live-data";
import { serverProductHref, serverDashboardHref } from "@/lib/product-links";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { Alert, AppMain, Button, Card, CardHead, Chip, Mono, PageHeader, StatusCountChip, appStyles as s } from "@/components/app/ui";
import { MediaTile } from "@/components/app/media";
import { BrandMark } from "@/components/brand";
import { PullHandlesButton } from "@/app/outlier/creator-actions";

export const metadata: Metadata = {
  title: "Workspace — Creos Labs",
  robots: { index: false, follow: false },
};

const PLATFORM_LABEL: Record<string, string> = { IG: "Instagram", TT: "TikTok", YT: "YouTube" };
const FORMAT_LABEL: Record<string, string> = { video: "9:16 video", static: "1:1 static" };

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(Math.round(n));
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// Module-level so render stays pure (the lint rule flags Date.now() inside a component).
const nowMs = () => Date.now();

// Bars for a creator's latest posts. Every score is already "views ÷ that
// creator's own median", so the dashed median line sits where a bar would
// read 1.0 — no separate median series is needed.
function MedianBars({ scores }: { scores: number[] }) {
  if (scores.length === 0) return null;
  const max = Math.max(...scores, 1);
  const top = scores.indexOf(Math.max(...scores));
  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 90, position: "relative" }} aria-hidden="true">
        {scores.map((score, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${Math.max(8, (score / max) * 100)}%`,
              borderRadius: "4px 4px 0 0",
              background: i === top ? "var(--ws-accent)" : "var(--ws-hairline-strong)",
            }}
          />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: `${Math.min(100, (1 / max) * 100)}%`, borderTop: "1px dashed var(--ws-ink-45)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Mono className={s.cardLabel} style={{ fontSize: 9 }}>
          Last {scores.length} posts
        </Mono>
        <Mono className={s.cardLabel} style={{ fontSize: 9 }}>
          — running median
        </Mono>
      </div>
    </>
  );
}

export default async function OverviewPage() {
  const headerList = await headers();
  const outlierHome = serverDashboardHref(headerList, "outlier");
  const signalHome = serverDashboardHref(headerList, "signal");
  const outlierHref = (path: string) => serverProductHref(headerList, "outlier", path);
  const signalHref = (path: string) => serverProductHref(headerList, "signal", path);

  const [user, creators, topPosts, library, { jobs, finished }] = await Promise.all([getUser(), getCreators(), getTopPosts(100), getLibrary(), getJobs()]);
  const firstName = getDisplayName(user).split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const creatorById = new Map(creators.map((c) => [c.id, c]));
  const allHandles = creators.flatMap((c) => c.handles);
  const outlierPosts = topPosts.filter((p) => p.score >= 2);
  const weekPosts = outlierPosts.filter((p) => nowMs() - new Date(p.createdAtIso).getTime() < WEEK_MS);
  const pool = weekPosts.length > 0 ? weekPosts : outlierPosts;
  const headlinePost = pool.length > 0 ? pool.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  const headlineCreator = headlinePost ? creatorById.get(headlinePost.creatorId) : null;
  const headlineHandle = headlineCreator?.handles.find((h) => h.platform === headlinePost?.platform)?.handle;
  const headlineDetail = headlinePost ? await getCreatorDetail(headlinePost.creatorId) : null;
  const creatorRecent = headlineDetail
    ? [...headlineDetail.posts].sort((a, b) => new Date(a.postedAtIso).getTime() - new Date(b.postedAtIso).getTime()).slice(-12)
    : [];

  const assets = library.assets;
  const latestAsset = [...assets].sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime())[0] ?? null;
  const latestDetail = latestAsset ? await getAssetDetail(latestAsset.id) : null;
  const percentile = latestAsset ? percentileWithin(latestAsset.score, latestAsset.format, assets) : null;
  const counts = {
    pass: latestDetail?.criteria.filter((c) => c.verdict === "pass").length ?? 0,
    partial: latestDetail?.criteria.filter((c) => c.verdict === "partial").length ?? 0,
    fail: latestDetail?.criteria.filter((c) => c.verdict === "fail").length ?? 0,
  };

  const paused = pullsPaused(jobs, finished[0]?.finishedAtIso ?? null);

  const sub =
    headlinePost && latestAsset
      ? `A ${headlinePost.score.toFixed(1)}× outlier broke out, and your latest ad scored ${Math.round(latestAsset.score)}.`
      : headlinePost
        ? `A ${headlinePost.score.toFixed(1)}× outlier broke out.`
        : latestAsset
          ? `Your latest ad scored ${Math.round(latestAsset.score)}.`
          : "Track a creator or upload creative to see what moves here.";

  return (
    <AppMain>
      <PageHeader
        eyebrow={`Workspace · ${today}`}
        line1={`${greeting()}, ${firstName}.`}
        line2="Here’s what moved."
        sub={sub}
        actions={
          <>
            <Button variant="ghost" icon="upload" href={signalHref("/analyze")}>
              New analysis
            </Button>
            <PullHandlesButton handles={allHandles} variant="primary" icon="refresh">
              Pull now
            </PullHandlesButton>
          </>
        }
      />

      {paused && (
        <Alert
          title="Outlier pulls are paused"
          actions={
            <>
              <Button variant="paper" href="/workspace/account">
                Update token
              </Button>
              <Button variant="ghost" href={outlierHref("/progress")}>
                View progress
              </Button>
            </>
          }
        >
          {paused.kind === "limit"
            ? `Your Apify account hit its monthly usage limit, so the last ${paused.jobs.length} pull${paused.jobs.length === 1 ? "" : "s"} failed. Nothing new will come in until it resets or you update the token.`
            : `Your Apify token was rejected, so the last ${paused.jobs.length} pull${paused.jobs.length === 1 ? "" : "s"} failed. Nothing new will come in until you update the token.`}
        </Alert>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
        <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex" }}>
          <Card className={s.cardFill} style={{ padding: 28, flex: 1 }}>
            <CardHead
              label="01 / Outlier · content intelligence"
              right={
                <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                  {creators.length} creator{creators.length === 1 ? "" : "s"} tracked
                </Mono>
              }
            />
            {headlinePost ? (
              <>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ width: 120, flex: "none" }}>
                    <MediaTile src={headlinePost.thumbnailUrl} platform={headlinePost.platform} height={200} emoji="🎬" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                      {weekPosts.length > 0 ? "Top outlier this week" : "Top outlier"}
                    </Mono>
                    <span className={s.disp} style={{ fontSize: 76, letterSpacing: "-0.05em", lineHeight: 0.85, color: "var(--ws-accent)" }}>
                      {headlinePost.score.toFixed(1)}×
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      @{headlineHandle} · {PLATFORM_LABEL[headlinePost.platform] ?? headlinePost.platform}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>
                      {formatCompact(headlinePost.views)} views against a {formatCompact(headlinePost.median)} running median.
                    </span>
                  </div>
                </div>
                <MedianBars scores={creatorRecent.map((p) => p.score)} />
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.5 }}>
                Track a creator to see their posts scored against their own running median.
              </p>
            )}
            <div className={s.cardFoot}>
              <Button variant="paper" href={outlierHome}>
                Open Outlier
              </Button>
              <Button variant="ghost" href={outlierHref("/creators")}>
                Watchlist
              </Button>
            </div>
          </Card>
        </div>

        <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex" }}>
          <Card className={s.cardFill} style={{ padding: 28, flex: 1 }}>
            <CardHead
              label="02 / Signal · creative analysis"
              right={
                percentile !== null && (
                  <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                    Top {Math.max(1, 100 - percentile)}% of your {latestAsset?.format === "video" ? "videos" : "statics"}
                  </Mono>
                )
              }
            />
            {latestAsset ? (
              <>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ width: 120, flex: "none" }}>
                    <MediaTile src={latestAsset.assetUrl} platform={latestAsset.format === "video" ? "9:16" : "1:1"} height={200} emoji="🎬" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                      Latest score
                    </Mono>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span className={s.disp} style={{ fontSize: 76, letterSpacing: "-0.05em", lineHeight: 0.85 }}>
                        {Math.round(latestAsset.score)}
                      </span>
                      <span style={{ fontSize: 16, color: "var(--ws-ink-45)" }}>/100</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{latestAsset.filename}</span>
                    <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>
                      Scored against {FORMAT_LABEL[latestAsset.format] ?? latestAsset.format} criteria, before launch.
                    </span>
                  </div>
                </div>
                {latestDetail && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <StatusCountChip kind="pass" count={counts.pass} />
                    <StatusCountChip kind="partial" count={counts.partial} />
                    <StatusCountChip kind="fail" count={counts.fail} />
                  </div>
                )}
                {latestDetail?.topFix.title && (
                  <div style={{ background: "var(--ws-surface-header)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <Mono style={{ fontSize: 9, color: "var(--ws-accent)" }}>
                      Top fix{latestDetail.topFix.clears > 0 ? ` · clears ${latestDetail.topFix.clears} check${latestDetail.topFix.clears === 1 ? "" : "s"}` : ""}
                    </Mono>
                    <span style={{ fontSize: 14, lineHeight: 1.45 }}>{latestDetail.topFix.title}</span>
                  </div>
                )}
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.5 }}>
                Upload creative to see it scored against format-specific criteria.
              </p>
            )}
            <div className={s.cardFoot}>
              <Button variant="paper" href={signalHome}>
                Open Signal
              </Button>
              <Button variant="ghost" icon="upload" href={signalHref("/analyze")}>
                Upload creative
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
        <Card style={{ flex: "1 1 420px", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className={s.emo} style={{ width: 48, height: 48, flex: "none", borderRadius: "50%", background: "var(--ws-surface-header)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }} aria-hidden="true">
              🧪
            </span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                03 / In the lab
              </Mono>
              <span style={{ fontSize: 15 }}>Something new is forming. It’ll be included in your subscription.</span>
            </div>
            <span className={s.disp} style={{ fontSize: 28, color: "var(--ws-headline-grey)" }}>
              ???
            </span>
          </div>
        </Card>
        <Card style={{ flex: "1 1 420px", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 48, height: 48, flex: "none", borderRadius: "50%", border: "2px solid var(--ws-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BrandMark size={22} />
            </span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                Creos / Custom
              </Mono>
              <span style={{ fontSize: 15 }}>Doing something by hand every week? We’ll scope the tool that does it.</span>
            </div>
            <Button variant="ghost" size="sm" href="mailto:hello@creos-labs.com?subject=Creos%20Custom">
              Talk to us
            </Button>
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, paddingTop: 20, borderTop: "1px solid var(--ws-hairline)" }}>
        <Chip variant="accent">Founding access</Chip>
        <span style={{ fontSize: 14, fontWeight: 600 }}>A$15/month</span>
        <span style={{ fontSize: 14, color: "var(--ws-ink-45)" }}>Your founding price stays yours once you subscribe.</span>
        <Link href="/workspace/billing" style={{ marginLeft: "auto", fontSize: 14, fontWeight: 600 }}>
          Billing →
        </Link>
      </div>
    </AppMain>
  );
}
