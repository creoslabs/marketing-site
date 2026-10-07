import type { Metadata } from "next";
import { getCreators, getPosts } from "../live-data";
import { FeedGrid } from "./feed-grid";

export const metadata: Metadata = {
  title: "Feed — Outlier",
  robots: { index: false, follow: false },
};

export default async function FeedPage() {
  const [creators, posts] = await Promise.all([getCreators(), getPosts()]);
  return <FeedGrid creators={creators} posts={posts} />;
}
