import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorDetail } from "../../live-data";
import { Avatar, EmptyState, PlatformBadge, ScoreChip, StatRow, Thumb, ThinHistoryPill } from "../../components";
import { AddPlatformButton, BatchRepurposeButton, PullWithLimit, RemoveCreatorButton, RemoveHandleButton } from "../../creator-actions";
import { formatCompact } from "../../format";
import { ExportCsvButton } from "./export-csv-button";
import { NotesField } from "./notes-field";

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

  const { creator, posts, patterns } = detail;
  const totalPosts = posts.length;
  const isThin = creator.handles.some((h) => h.thin);

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
        <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={48} />
        <div>
          <div className="flex items-center gap-[8px]">
            <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
              {creator.displayName}
            </h1>
            {isThin && <ThinHistoryPill />}
          </div>
          <div className="mt-[6px] flex flex-wrap items-center gap-[6px]">
            {creator.handles.map((h) => (
              <span
                key={h.id}
                className="flex items-center gap-[6px] rounded-[20px] text-[11px] font-medium"
                style={{ padding: "4px 6px 4px 10px", background: "var(--ws-surface-header)", color: "var(--ws-ink-60)" }}
              >
                {h.platform} @{h.handle}
                <RemoveHandleButton handleId={h.id} handle={h.handle} />
              </span>
            ))}
            <AddPlatformButton creatorId={creator.id} />
          </div>
        </div>
        <div className="flex-1" />
        <ExportCsvButton posts={posts} filename={`${creator.displayName.replace(/\s+/g, "-").toLowerCase()}-posts.csv`} />
        <BatchRepurposeButton posts={posts} />
        <PullWithLimit handles={creator.handles} />
        <RemoveCreatorButton creatorId={creator.id} handle={creator.handles[0]?.handle ?? creator.displayName} />
      </div>

      <NotesField creatorId={creator.id} initialNotes={creator.notes} />

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

      {creator.platformStats.length > 1 && (
        <div className="ws-card mt-[14px]" style={{ padding: "16px 18px" }}>
          <p className="ws-eyebrow">PLATFORM COMPARISON</p>
          <p className="mt-[4px] text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
            Each scored against that platform&rsquo;s own median, not blended together.
          </p>
          <div className="mt-[12px] grid gap-[10px]" style={{ gridTemplateColumns: `repeat(${creator.platformStats.length}, 1fr)` }}>
            {creator.platformStats.map((stat) => (
              <div key={stat.platform} className="rounded-[8px]" style={{ padding: "12px 14px", background: "var(--ws-surface-header)" }}>
                <div className="flex items-center gap-[6px]">
                  <PlatformBadge platform={stat.platform} />
                  <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                    {stat.postCount} post{stat.postCount === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="ws-tabular mt-[8px] text-[17px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-accent-text)" }}>
                  {stat.bestScore.toFixed(1)}×
                </p>
                <p className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                  best · median {formatCompact(stat.median)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
          Hook patterns
        </h2>
        {patterns.analyzedCount === 0 ? (
          <div className="ws-card mt-[14px]">
            <EmptyState
              title="No analyzed posts yet"
              description="Transcribe & analyze one of this creator's posts to start seeing which hooks and beats actually work for them."
            />
          </div>
        ) : (
          <div className="ws-card mt-[14px]" style={{ padding: "18px 20px 20px" }}>
            <p className="ws-eyebrow">
              FROM {patterns.analyzedCount} ANALYZED POST{patterns.analyzedCount === 1 ? "" : "S"}
            </p>
            <div className="mt-[16px] grid gap-[22px] sm:grid-cols-2">
              <div>
                <p className="text-[11.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
                  Hook style
                </p>
                <div className="mt-[10px] flex flex-col gap-[9px]">
                  {patterns.hookTags.map((tag) => (
                    <div key={tag.label} className="flex items-center gap-[9px]">
                      <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: "var(--ws-ink)" }}>
                        {tag.label}
                      </span>
                      <div className="h-[6px] w-[60px] shrink-0 overflow-hidden rounded-full" style={{ background: "var(--ws-surface-header)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(tag.count / patterns.analyzedCount) * 100}%`, background: "var(--ws-accent)" }}
                        />
                      </div>
                      <span className="ws-tabular shrink-0 text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                        {tag.count}/{patterns.analyzedCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
                  Common beats
                </p>
                <div className="mt-[10px] flex flex-wrap gap-[6px]">
                  {patterns.beatNames.map((beat) => (
                    <span
                      key={beat.label}
                      className="rounded-[20px] text-[11px] font-medium"
                      style={{ padding: "5px 10px", background: "var(--ws-surface-header)", color: "var(--ws-ink-60)" }}
                    >
                      {beat.label} · {beat.count}/{patterns.analyzedCount}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
                  <div className="absolute bottom-[7px] left-[7px]" style={{ zIndex: 2 }}>
                    <ScoreChip score={post.score} median={post.median} />
                  </div>
                </Thumb>
                <div className="mt-[6px]">
                  <StatRow views={post.views} engagement={post.engagement} size="sm" />
                </div>
                <p className="mt-[2px] truncate text-[10.5px]" style={{ color: "var(--ws-ink-45)" }}>
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
