import type { Metadata } from "next";
import { getCreators } from "../live-data";
import { CreatorsTable } from "./creators-table";

export const metadata: Metadata = {
  title: "Creators — Outlier",
  robots: { index: false, follow: false },
};

export default async function CreatorsPage() {
  const creators = await getCreators();
  return <CreatorsTable creators={creators} />;
}
