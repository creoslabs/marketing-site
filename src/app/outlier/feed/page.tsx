import type { Metadata } from "next";
import { getFeedData } from "../live-data";
import { FeedGrid } from "./feed-grid";

export const metadata: Metadata = {
  title: "Feed — Outlier",
  robots: { index: false, follow: false },
};

export default async function FeedPage() {
  const data = await getFeedData();
  return (
    <FeedGrid
      creators={data.creators}
      initialPosts={data.posts}
      outlierCount={data.outlierCount}
      platforms={data.platforms}
      hookOptions={data.hookOptions}
      initialLoadedAll={data.loadedAll}
    />
  );
}
