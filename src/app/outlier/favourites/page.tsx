import type { Metadata } from "next";
import Link from "next/link";
import { getCreators, getFavouritePosts } from "../live-data";
import { Avatar, EmptyState, PlatformBadge, ScoreChip, StatRow, Thumb } from "../components";

export const metadata: Metadata = {
  title: "Favourites — Outlier",
  robots: { index: false, follow: false },
};

export default async function FavouritesPage() {
  const [creators, posts] = await Promise.all([getCreators(), getFavouritePosts()]);
  const creatorById = new Map(creators.map((c) => [c.id, c]));

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div>
        <h1 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
          Favourites
        </h1>
        <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
          {posts.length} saved post{posts.length === 1 ? "" : "s"}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-[18px]">
          <EmptyState
            size="large"
            title="No favourites yet"
            description="Star a post from its video page to save it here for quick reference later."
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
                  {post.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- a scraped CDN URL, not a static asset next/image can optimize
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute left-[8px] top-[8px]" style={{ zIndex: 2 }}>
                    <PlatformBadge platform={post.platform} />
                  </div>
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
                  {creator && <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={26} />}
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {handle}
                    </p>
                    <p className="truncate text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                      {post.postedAt}
                    </p>
                  </div>
                </div>
                <div className="mt-[7px]">
                  <StatRow views={post.views} engagement={post.engagement} />
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
