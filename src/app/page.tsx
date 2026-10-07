import type { Metadata } from "next";
import { HomePage } from "@/components/site/HomePage";

export const metadata: Metadata = {
  title: "Creos Labs — Marketing, engineered",
  description:
    "Social media marketing tools and custom builds for teams, agencies and creators. Outlier and Signal are live — made by a marketer, for people who actually run campaigns.",
};

export default function Home() {
  return <HomePage />;
}
