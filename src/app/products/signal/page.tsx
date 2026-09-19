import type { Metadata } from "next";
import { ProductLandingPage } from "@/components/ProductLandingPage";
import { SIGNAL_PRODUCT } from "@/lib/product-data";

export const metadata: Metadata = {
  title: "Signal — Creos Labs",
  description: "Upload creative and get structured feedback on the elements that influence attention, clarity and performance.",
};

const HOW_IT_WORKS = [
  {
    title: "Upload creative",
    body: "A static image or a video ad — one at a time, or a whole round of creative together.",
  },
  {
    title: "Get scored",
    body: "Checked tier by tier against format-specific best-practice criteria — structural checks like safe zones and hook timing, contextual calls like framing and clarity.",
  },
  {
    title: "See what to fix",
    body: "One top-priority recommendation, plus how the asset compares to everything else you've analyzed in that format.",
  },
];

const USE_CASES = [
  "Review creative before you spend on it.",
  "Catch safe-zone and hook-timing issues automatically.",
  "Compare a batch of concepts side by side.",
  "Benchmark a new ad against your own past work.",
  "Send a designer a clean, exportable report.",
];

const FAQS = [
  {
    q: "What formats does Signal check?",
    a: "Static images and video ads, each scored against its own format-specific criteria — a video score and a static score are never averaged together.",
  },
  {
    q: "Does it guarantee performance?",
    a: "No. Signal checks structural and best-practice signals — it doesn't predict spend outcomes or guarantee results.",
  },
  {
    q: "Can I upload more than one asset at once?",
    a: "Yes — batch upload analyzes a whole round of creative together, so you can compare scores side by side.",
  },
];

export default function SignalPage() {
  return (
    <ProductLandingPage
      product={SIGNAL_PRODUCT}
      heroDescription={SIGNAL_PRODUCT.description}
      howItWorks={HOW_IT_WORKS}
      useCases={USE_CASES}
      faqs={FAQS}
    />
  );
}
