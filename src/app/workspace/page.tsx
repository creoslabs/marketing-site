import type { Metadata } from "next";
import { headers } from "next/headers";
import { getCreators, getPosts } from "@/app/outlier/live-data";
import { getLibrary, getAssetDetail, percentileWithin } from "@/app/signal/live-data";
import { serverProductHref } from "@/lib/product-links";
import Link from "next/link";
import { WsHero as WorkspaceHero } from "@/components/ws-hero";
import { OverviewProductCard } from "./overview-product-card";
import { OutlierMedianChart, SignalCriteriaStrip } from "./overview-charts";

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

function weekdayDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });
}

function isRecentOutlier(post: { createdAtIso: string }) {
  return Date.now() - new Date(post.createdAtIso).getTime() < 24 * 60 * 60 * 1000;
}

function daysAgoFrom(iso: string) {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export default async function OverviewPage() {
  const headerList = await headers();
  const outlierHref = (path: string) => serverProductHref(headerList, "outlier", path);
  const signalHref = (path: string) => serverProductHref(headerList, "signal", path);

  const [creators, posts, library] = await Promise.all([getCreators(), getPosts(), getLibrary()]);

  const creatorById = new Map(creators.map((c) => [c.id, c]));
  const outlierPosts = posts.filter((p) => p.score >= 2);
  const recentOutliers = outlierPosts.filter(isRecentOutlier);

  const recentScores = [...posts]
    .sort((a, b) => new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime())
    .slice(-10)
    .map((p) => p.score);

  // The single best-performing post is the card's "live proof" headline —
  // real, not a fabricated example.
  const headlinePost = outlierPosts.length > 0 ? outlierPosts.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  const headlineCreator = headlinePost ? creatorById.get(headlinePost.creatorId) : null;
  const headlineHandle = headlineCreator?.handles.find((h) => h.platform === headlinePost?.platform)?.handle;
  const headlinePlatformCount = headlineCreator?.platformStats.find((p) => p.platform === headlinePost?.platform)
    ?.postCount;
  const daysAgo = headlinePost ? daysAgoFrom(headlinePost.postedAtIso) : null;

  const assets = library.assets;
  const sortedAssets = [...assets].sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime());
  const headlineAsset = sortedAssets[0] ?? null;
  const headlineAssetDetail = headlineAsset ? await getAssetDetail(headlineAsset.id) : null;
  const headlinePercentile = headlineAsset ? percentileWithin(headlineAsset.score, headlineAsset.format, assets) : null;
  const topFailNote = headlineAssetDetail?.criteria.find((c) => c.verdict === "fail")?.evidence ?? null;

  return (
    <div className="ws-page-in">
      <WorkspaceHero
        eyebrow={`Workspace / ${weekdayDate(new Date())}`}
        line1="Morning."
        line2="Here's what moved."
        sub={
          headlinePost
            ? `A ${headlinePost.score.toFixed(1)}× outlier broke out and ${assets.length > 0 ? "your creative library keeps growing" : "there's more to check before you spend"}.`
            : "Track a creator or upload creative to see what moves here."
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "36px 28px 0" }}>
        <OverviewProductCard
          eyebrow="01 / Content intelligence"
          statusMeta={recentOutliers.length > 0 ? `${recentOutliers.length} new since yesterday` : `${creators.length} creator${creators.length === 1 ? "" : "s"} tracked`}
          name="Outlier"
          description={
            headlinePost && headlineHandle
              ? `@${headlineHandle}, “${headlinePost.caption}”. ${formatCompact(headlinePost.views)} views in ${daysAgo} day${daysAgo === 1 ? "" : "s"} against a ${formatCompact(headlinePost.median)} median.`
              : "Track a creator to see their posts scored against their own running median."
          }
          score={headlinePost ? headlinePost.score.toFixed(1) : "—"}
          scoreUnit="×"
          scoreMeta={
            headlinePost
              ? `${PLATFORM_LABEL[headlinePost.platform] ?? headlinePost.platform}${headlinePlatformCount ? ` · ${headlinePlatformCount} posts` : ""}`
              : "No posts yet"
          }
          viz={
            <OutlierMedianChart
              scores={recentScores}
              medianLabel={headlinePost ? `Running median ${formatCompact(headlinePost.median)}` : "No median yet"}
              sinceLabel={daysAgo ? `${daysAgo * 24} h after posting` : ""}
            />
          }
          primaryHref={outlierHref("/feed")}
          primaryLabel="Open Outlier ↗"
          secondaryHref={outlierHref("/creators")}
          secondaryLabel="Watchlist"
        />

        <OverviewProductCard
          eyebrow="02 / Creative analysis"
          statusMeta={headlinePercentile !== null ? `Top ${100 - headlinePercentile}% of your ${assets.length}` : `${assets.length} analysed`}
          name="Signal"
          description={
            headlineAsset
              ? `${headlineAsset.filename}. Scored against ${FORMAT_LABEL[headlineAsset.format] ?? headlineAsset.format} criteria, before launch.`
              : "Upload creative to see it scored against format-specific criteria."
          }
          score={headlineAsset ? String(Math.round(headlineAsset.score)) : "—"}
          scoreUnit="/100"
          scoreMeta={
            headlineAssetDetail
              ? `${FORMAT_LABEL[headlineAsset!.format] ?? headlineAsset!.format} · ${headlineAssetDetail.criteria.length} criteria`
              : "No assets yet"
          }
          viz={<SignalCriteriaStrip criteria={headlineAssetDetail?.criteria ?? []} note={topFailNote} />}
          primaryHref={signalHref("/analyze")}
          primaryLabel="Open Signal ↗"
          secondaryHref={signalHref("/analyze")}
          secondaryLabel="Upload creative"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "14px 28px 0" }}>
        <div className="ws-card flex items-center" style={{ padding: "22px 28px", gap: 18 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="ws-eyebrow" style={{ marginBottom: 12 }}>
              03 / In the lab
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--ws-ink)" }}>
              Something new is forming. It&rsquo;ll be included in your subscription.
            </p>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ws-ink-45)" }}>???</div>
        </div>
        <div className="ws-card flex items-center" style={{ padding: "22px 28px", gap: 18 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="ws-eyebrow" style={{ marginBottom: 12 }}>
              Creos / Custom
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--ws-ink)" }}>
              Doing something by hand every week? We&rsquo;ll scope the tool that does it.
            </p>
          </div>
          <a href="mailto:hello@creos-labs.com?subject=Creos%20Custom" style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ws-accent-text)", whiteSpace: "nowrap" }}>
            Talk to us ↗
          </a>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center"
        style={{ gap: 14, margin: "36px 28px 0", padding: "18px 0 28px", borderTop: "1px solid var(--ws-hairline)" }}
      >
        <p className="ws-eyebrow">Founding access</p>
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: "var(--ws-ink)", whiteSpace: "nowrap" }}>
          A$15 / month
        </p>
        <p style={{ margin: 0, fontSize: 11.5, color: "var(--ws-ink-45)" }}>
          Your founding price stays yours once you subscribe.
        </p>
        <div className="flex-1" />
        <Link href="/workspace/billing" style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ws-accent-text)", whiteSpace: "nowrap" }}>
          Billing ↗
        </Link>
      </div>
    </div>
  );
}
