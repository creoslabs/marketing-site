import type { Metadata } from "next";
import { OutlierPage } from "@/components/site/OutlierPage";

export const metadata: Metadata = {
  title: "Outlier — Creos Labs",
  description: "Track creators and content in your space, and find what's outperforming their normal baseline.",
};

export default function OutlierRoute() {
  return <OutlierPage />;
}
