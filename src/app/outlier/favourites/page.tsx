import type { Metadata } from "next";
import { getCreators, getFavouritePosts, getCollections } from "../live-data";
import { FavouritesGrid } from "./favourites-grid";

export const metadata: Metadata = {
  title: "Favourites — Outlier",
  robots: { index: false, follow: false },
};

export default async function FavouritesPage() {
  const [creators, posts, collections] = await Promise.all([getCreators(), getFavouritePosts(), getCollections()]);
  return <FavouritesGrid posts={posts} creators={creators} collections={collections} />;
}
