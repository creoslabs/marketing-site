import type { Metadata } from "next";
import { SignalPage } from "@/components/site/SignalPage";

export const metadata: Metadata = {
  title: "Signal — Creos Labs",
  description: "Upload creative before you publish. Signal checks it beat by beat and benchmarks the score against everything you've made.",
};

export default function SignalRoute() {
  return <SignalPage />;
}
