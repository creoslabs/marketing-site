import type { Metadata } from "next";
import { SignalHomePage } from "@/components/home/SignalHomePage";

export const metadata: Metadata = {
  title: "Signal — Creos Labs",
  description: "Upload creative before you publish. Signal checks it beat by beat and benchmarks the score against everything you've made.",
};

export default function SignalPage() {
  return <SignalHomePage />;
}
