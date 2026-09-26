import type { Metadata } from "next";
import { getCreators, getPostsByHookTag } from "../../live-data";
import { FeedGrid } from "../../feed/feed-grid";

export async function generateMetadata(props: PageProps<"/outlier/tags/[tag]">): Promise<Metadata> {
  const { tag } = await props.params;
  return {
    title: `“${decodeURIComponent(tag)}” — Outlier`,
    robots: { index: false, follow: false },
  };
}

// The hook-tag rabbit hole: click a tag on one post (its own page, or a
// creator's ranked hook-style list) and land here on every post across the
// whole watchlist sharing it, ranked the same way the Feed ranks anything
// else. Reuses FeedGrid wholesale — sort, platform isolation, bulk
// favourite, the outliers-only default all just work on this narrower set.
export default async function HookTagPage(props: PageProps<"/outlier/tags/[tag]">) {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);

  const [creators, posts] = await Promise.all([getCreators(), getPostsByHookTag(decoded)]);

  // Nicely-cased label from an actual match, since matching itself is
  // lowercased/trimmed — falls back to the raw param if nothing matched.
  const label = posts[0]?.hookTags.find((t) => t.trim().toLowerCase() === decoded.trim().toLowerCase()) ?? decoded;

  return (
    <FeedGrid
      creators={creators}
      posts={posts}
      title={`“${label}”`}
      backLink={{ href: "/outlier/feed", label: "Feed" }}
      emptyTitle="No posts tagged this yet"
      emptyDescription="This hook style hasn't shown up in any analyzed post across your watchlist."
    />
  );
}
