import type { Metadata } from "next";
import { ProductLandingPage } from "@/components/ProductLandingPage";
import { OUTLIER_PRODUCT } from "@/lib/product-data";

export const metadata: Metadata = {
  title: "Outlier — Creos Labs",
  description: "Track creators and content in your space, and find what's outperforming their normal baseline.",
};

const HOW_IT_WORKS = [
  {
    title: "Add creators",
    body: "Track a creator across TikTok, Instagram, and YouTube — one card per person, however many platforms they're on.",
  },
  {
    title: "Pull posts",
    body: "Outlier scores every post against that creator's own running median, not a universal benchmark.",
  },
  {
    title: "Go deeper",
    body: "Auto-transcribe any post and see its hook, structure, and beats — why it worked, not just that it did.",
  },
];

const USE_CASES = [
  "Track creators in your niche.",
  "Spot a post before it's obviously a hit.",
  "Find hook styles worth repurposing.",
  "Rank every tracked post in one feed.",
  "Watch a creator's median trend over time.",
];

const FAQS = [
  {
    q: "Which platforms does Outlier support?",
    a: "TikTok, Instagram, and YouTube — a single creator can be tracked across any combination of them under one card.",
  },
  {
    q: "How is the score calculated?",
    a: "Against the creator's own running median views, not a universal benchmark — so a small account's breakout post scores the same way a large account's does.",
  },
  {
    q: "Does it write scripts for me?",
    a: "No. It shows you the structure of what worked — hook, beats, hook style — so you can write the next one with that in mind.",
  },
];

export default function OutlierPage() {
  return (
    <ProductLandingPage
      product={OUTLIER_PRODUCT}
      heroDescription={OUTLIER_PRODUCT.description}
      howItWorks={HOW_IT_WORKS}
      useCases={USE_CASES}
      faqs={FAQS}
    />
  );
}
