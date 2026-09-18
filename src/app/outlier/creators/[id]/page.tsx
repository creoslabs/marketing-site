import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorDetail } from "../../live-data";
import { Avatar, EmptyState, PlatformBadge, ScoreChip, Thumb, ThinHistoryPill } from "../../components";
import { PullCreatorButton, RemoveCreatorButton } from "../../creator-actions";
import { formatCompact } from "../../format";

export async function generateMetadata(props: PageProps<"/outlier/creators/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const detail = await getCreatorDetail(id);
  return {
    title: detail ? `${detail.creator.displayName} — Outlier` : "Creator — Outlier",
    robots: { index: false, follow: false },
  };
}

export default async function CreatorDetailPage(props: PageProps<"/outlier/creators/[id]">) {
  const { id } = await props.params;
  const detail = await getCreatorDetail(id);
  if (!detail) notFound();

  const { creator, posts } = detail;
  const handle = creator.handles[0];
  const totalPosts = handle.postCount;
  const isThin = handle.thin;

  // Views-per-post, most recent first, for the bar chart below.
  const history = posts.slice(0, 12).map((post, index) => ({
    index,
    views: post.views,
    isOutlier: post.score >= 2,
  }));
  const maxViews = history.length > 0 ? Math.max(...history.map((h) => h.views), 1) : 1;
  const medianPct = (creator.median / maxViews) * 100;

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <Link href="/outlier/creators" className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
        ← Creators
      </Link>

      <div className="mt-[16px] flex flex-wrap items-center gap-[16px]">
        <Avatar initials={creator.initials} size={48} />
        <div>
          <div className="flex items-center gap-[8px]">
            <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
              {creator.displayName}
            </h1>
            {isThin && <ThinHistoryPill />}
          </div>
          <p className="mt-[4px] text-[12.5px]" style={{ color: "var(--ws-ink-45)" }}>
            {creator.handles.map((h) => `${h.platform} ${h.handle}`).join(" · ")}
          </p>
        </div>
        <div className="flex-1" />
        <PullCreatorButton creatorId={creator.id} handle={handle.handle} className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" />
        <RemoveCreatorButton creatorId={creator.id} handle={handle.handle} />
      </div>

      <div className="ws-stack-row mt-[18px]">
        <div className="flex-1" style={{ padding: "15px 16px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>MEDIAN</p>
          <p className="ws-tabular text-[20px] font-bold tracking-[-0.03em]" style={{ color: "var(--ws-ink)" }}>
            {formatCompact(creator.median)}
          </p>
        </div>
        <div className="flex-1" style={{ padding: "15px 16px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>POSTS PULLED</p>
          <p className="ws-tabular text-[20px] font-bold tracking-[-0.03em]" style={{ color: "var(--ws-ink)" }}>
            {totalPosts}
          </p>
        </div>
        <div className="flex-1" style={{ padding: "15px 16px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>BEST SCORE</p>
          <p className="ws-tabular text-[20px] font-bold tracking-[-0.03em]" style={{ color: "var(--ws-accent-text)" }}>
            {creator.bestScore.toFixed(1)}×
          </p>
        </div>
        <div className="flex-1" style={{ padding: "15px 16px" }}>
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>CADENCE</p>
          <p className="text-[20px] font-bold tracking-[-0.03em]" style={{ color: "var(--ws-ink)" }}>
            {creator.cadence}
          </p>
        </div>
      </div>

      {totalPosts === 0 ? (
        <div className="ws-card mt-[14px]">
          <EmptyState
            title="No posts pulled yet"
            description="Views-per-post needs at least a few pulled posts before a median means anything."
          />
        </div>
      ) : (
        <div className="ws-card mt-[14px]" style={{ padding: "18px 20px 20px" }}>
          <div className="flex items-center">
            <p className="ws-eyebrow">VIEWS PER POST · MOST RECENT</p>
            <div className="flex-1" />
            <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
              median {formatCompact(creator.median)}
            </span>
          </div>
          <div className="relative mt-[18px] flex items-end gap-[10px]" style={{ height: 140 }}>
            <div
              className="absolute inset-x-0 border-t border-dashed"
              style={{ bottom: `${medianPct}%`, borderColor: "var(--ws-ink-45)" }}
            />
            {history.map((point) => (
              <div key={point.index} className="flex flex-1 flex-col items-center justify-end" style={{ height: "100%" }}>
                <div
                  className="w-full rounded-t-[3px]"
                  style={{
                    height: `${(point.views / maxViews) * 100}%`,
                    background: point.isOutlier ? "var(--ws-accent)" : "var(--ws-ink-45)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-[18px]">
        <h2 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
          Posts
        </h2>
        {posts.length === 0 ? (
          <div className="ws-card mt-[14px]">
            <EmptyState title="No posts pulled yet" />
          </div>
        ) : (
          <div className="mt-[14px] grid grid-cols-2 gap-[16px] sm:grid-cols-3 lg:grid-cols-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/outlier/video/${post.id}`} className="block">
                <Thumb aspectRatio="9/13" radius={10}>
                  <div className="absolute left-[7px] top-[7px]" style={{ zIndex: 2 }}>
                    <PlatformBadge platform={post.platform} />
                  </div>
                  <div className="absolute bottom-[7px] left-[7px]" style={{ zIndex: 2 }}>
                    <ScoreChip score={post.score} />
                  </div>
                </Thumb>
                <p className="mt-[6px] truncate text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                  {post.postedAt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
