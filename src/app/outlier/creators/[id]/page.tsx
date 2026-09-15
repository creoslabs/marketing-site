import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreator, getCreatorPosts, getCreatorHistory } from "../../data";
import { Avatar, PlatformBadge, ScoreChip, Thumb, ThinHistoryPill } from "../../components";
import { formatCompact } from "../../format";

export async function generateMetadata(props: PageProps<"/outlier/creators/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const creator = getCreator(id);
  return {
    title: creator ? `${creator.displayName} — Outlier` : "Creator — Outlier",
    robots: { index: false, follow: false },
  };
}

export default async function CreatorDetailPage(props: PageProps<"/outlier/creators/[id]">) {
  const { id } = await props.params;
  const creator = getCreator(id);
  if (!creator) notFound();

  const posts = getCreatorPosts(id);
  const history = getCreatorHistory(creator);
  const maxViews = Math.max(...history.map((h) => h.views));
  const medianPct = (creator.median / maxViews) * 100;
  const totalPosts = creator.handles.reduce((sum, h) => sum + h.postCount, 0);
  const isThin = creator.handles.some((h) => h.thin);

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

      <div className="ws-card mt-[14px]" style={{ padding: "18px 20px 20px" }}>
        <div className="flex items-center">
          <p className="ws-eyebrow">VIEWS PER POST</p>
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

      <div className="mt-[18px]">
        <h2 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
          Posts
        </h2>
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
          {posts.length === 0 && (
            <p className="text-[12.5px]" style={{ color: "var(--ws-ink-45)" }}>
              No posts pulled yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
