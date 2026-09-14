import { Reveal } from "@/components/Reveal";
import { ProductShowcase, type ProductData } from "@/components/ProductShowcase";

const PRODUCTS: ProductData[] = [
  {
    name: "Outlier",
    tagline: "Track what's actually working across your niche.",
    description:
      "Outlier scores every post against your own running median, then surfaces the topics and hook styles converting above the norm across the creators you track — so you know what's worth repurposing, not just what already went viral.",
    imageSide: "left",
    highlights: [
      {
        label: "Outlier Score",
        description: "Every post scored against your own running median, not a vanity benchmark.",
        dotClassName: "bg-accent-blue",
        activeClassName: "border-accent-blue",
        screenshot: "/screenshots/outlier-score.png",
        screenshotAlt: "Outlier creator detail view showing views-per-post over time and a scored list of posts",
        screenshotWidth: 1524,
        screenshotHeight: 1094,
      },
      {
        label: "Topics running hot",
        description: "See which topics and hook styles are converting above median across every creator you track.",
        dotClassName: "bg-accent-violet",
        activeClassName: "border-accent-violet",
        screenshot: "/screenshots/outlier-topics.png",
        screenshotAlt: "Outlier topics running hot panel showing multiplier scores for trending content topics",
        screenshotWidth: 1160,
        screenshotHeight: 968,
      },
      {
        label: "Worth repurposing",
        description: "Patterns proven to work elsewhere, flagged before your niche catches on.",
        dotClassName: "bg-accent-coral",
        activeClassName: "border-accent-coral",
        screenshot: "/screenshots/outlier-repurpose.png",
        screenshotAlt: "Outlier hook styles converting panel with a worth repurposing recommendation callout",
        screenshotWidth: 1014,
        screenshotHeight: 968,
      },
    ],
  },
  {
    name: "Signal",
    tagline: "Know why an ad works before you spend to find out.",
    description:
      "Signal scores static and video ad creative against best-practice criteria — structural checks like safe zones and hook timing, contextual calls like framing and clarity — then predicts where an ad loses people against your category's top performers.",
    imageSide: "right",
    highlights: [
      {
        label: "Best-practice scoring",
        description: "Every asset checked tier by tier against format-specific criteria.",
        dotClassName: "bg-accent-blue",
        activeClassName: "border-accent-blue",
        screenshot: "/screenshots/signal-scoring.png",
        screenshotAlt: "Signal best-practice score report with a tier one structural checklist of pass, partial, and fail results",
        screenshotWidth: 1300,
        screenshotHeight: 792,
      },
      {
        label: "Predicted retention",
        description: "See where an ad loses people, benchmarked against category top performers.",
        dotClassName: "bg-accent-violet",
        activeClassName: "border-accent-violet",
        screenshot: "/screenshots/signal-retention.png",
        screenshotAlt: "Signal predicted retention curve compared against category top quartile, with a recommended top fix",
        screenshotWidth: 1300,
        screenshotHeight: 615,
      },
      {
        label: "Batch review",
        description: "Score a whole round of creative at once, sorted and ready to run.",
        dotClassName: "bg-accent-coral",
        activeClassName: "border-accent-coral",
        screenshot: "/screenshots/signal-batch.png",
        screenshotAlt: "Signal batch summary showing a sorted grid of scored ad creative assets ready to run",
        screenshotWidth: 1300,
        screenshotHeight: 605,
      },
    ],
  },
];

export default function WhatWereBuilding() {
  return (
    <section id="building" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            What we&apos;re building
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Two tools, both in development.
          </p>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted">
            Not just surface-level stats, but the craft and structure
            underneath what actually performs.
          </p>
        </Reveal>

        <div className="mt-20 flex flex-col gap-28">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.name} delay={i * 100}>
              <ProductShowcase product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
