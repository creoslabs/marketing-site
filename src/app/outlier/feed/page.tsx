import type { Metadata } from "next";
import Link from "next/link";
import { getCreators, getPosts } from "../live-data";
import { Avatar, EmptyState, PlatformBadge, ScoreChip, Thumb, ThinHistoryPill } from "../components";
import { AddCreatorButton, PullHandlesButton } from "../creator-actions";
import { formatCompact } from "../format";

export const metadata: Metadata = {
  title: "Feed — Outlier",
  robots: { index: false, follow: false },
};

export default async function FeedPage() {
  const [creators, posts] = await Promise.all([getCreators(), getPosts()]);
  const creatorById = new Map(creators.map((c) => [c.id, c]));
  const above2x = posts.filter((post) => post.score >= 2).length;

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            Top outliers
          </h1>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            {above2x} posts above 2×
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <button
            type="button"
            className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
            style={{ padding: "9px 12px" }}
          >
            Score ▾
          </button>
          <button
            type="button"
            className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
            style={{ padding: "9px 12px" }}
          >
            Filters · 2
          </button>
          <AddCreatorButton className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "9px 12px" }}>
            + Add creator
          </AddCreatorButton>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="mt-[18px]">
          <EmptyState
            size="large"
            title={creators.length === 0 ? "Nothing to show yet" : "No posts pulled yet"}
            description={
              creators.length === 0
                ? "Add a creator to your watchlist to start seeing their posts ranked here."
                : "Your watchlist is set up — pull now to start scoring posts against each creator's own median."
            }
            action={
              creators.length === 0 ? (
                <AddCreatorButton className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "10px 14px" }}>
                  + Add creator
                </AddCreatorButton>
              ) : (
                <PullHandlesButton handles={creators.flatMap((c) => c.handles)} />
              )
            }
          />
        </div>
      ) : (
      <div className="mt-[18px] grid grid-cols-2 gap-[18px] sm:grid-cols-3 lg:grid-cols-5">
        {posts.map((post) => {
          const creator = creatorById.get(post.creatorId);
          const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle;
          return (
            <Link key={post.id} href={`/outlier/video/${post.id}`} className="block">
              <Thumb aspectRatio="9/13" radius={11}>
                <div className="absolute left-[8px] top-[8px]" style={{ zIndex: 2 }}>
                  <PlatformBadge platform={post.platform} />
                </div>
                {post.thin && (
                  <div className="absolute right-[8px] top-[8px]" style={{ zIndex: 2 }}>
                    <ThinHistoryPill />
                  </div>
                )}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: 52,
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--ws-ground) 70%, transparent), transparent)",
                  }}
                />
                <div className="absolute bottom-[8px] left-[8px]" style={{ zIndex: 2 }}>
                  <ScoreChip score={post.score} />
                </div>
              </Thumb>

              <div className="mt-[8px] flex items-center gap-[7px]">
                {creator && <Avatar initials={creator.initials} size={26} />}
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {handle}
                  </p>
                  <p className="truncate text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                    {formatCompact(post.views)} views · {post.postedAt}
                  </p>
                </div>
              </div>
              <p
                className="mt-[6px] text-[11.5px] leading-[1.4]"
                style={{ color: "var(--ws-ink-60)", textWrap: "pretty" as React.CSSProperties["textWrap"] }}
              >
                {post.caption.split("\n")[0]}
              </p>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
