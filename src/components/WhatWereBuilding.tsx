import { Reveal } from "@/components/Reveal";
import { ProductShowcase, type ProductData } from "@/components/ProductShowcase";
import { SectionProgress } from "@/components/SectionProgress";

const PRODUCTS: ProductData[] = [
  {
    name: "Outlier",
    tagline: "Track what's actually working across your niche.",
    description:
      "Outlier scores every post against your own running median, then surfaces the topics and hook styles converting above the norm across the creators you track — so you know what's worth repurposing, not just what already went viral.",
    imageSide: "left",
    filmstripSrc: "/screenshots/outlier-filmstrip.png",
    filmstripWidth: 1300,
    filmstripHeight: 3307,
    highlights: [
      {
        label: "Outlier Score",
        description: "Every post scored against your own running median, not a vanity benchmark.",
        dotClassName: "bg-accent-blue",
        glowClassName: "bg-accent-blue/15",
        screenshotAlt: "Outlier creator detail view showing views-per-post over time and a scored list of posts",
        zoomOffsetY: 0,
        zoomHeight: 933,
      },
      {
        label: "Topics running hot",
        description: "See which topics and hook styles are converting above median across every creator you track.",
        dotClassName: "bg-accent-violet",
        glowClassName: "bg-accent-violet/15",
        screenshotAlt: "Outlier topics running hot panel showing multiplier scores for trending content topics",
        zoomOffsetY: 957,
        zoomHeight: 1085,
      },
      {
        label: "Worth repurposing",
        description: "Patterns proven to work elsewhere, flagged before your niche catches on.",
        dotClassName: "bg-accent-coral",
        glowClassName: "bg-accent-coral/15",
        screenshotAlt: "Outlier hook styles converting panel with a worth repurposing recommendation callout",
        zoomOffsetY: 2066,
        zoomHeight: 1241,
      },
    ],
  },
  {
    name: "Signal",
    tagline: "Know why an ad works before you spend to find out.",
    description:
      "Signal scores static and video ad creative against best-practice criteria — structural checks like safe zones and hook timing, contextual calls like framing and clarity — then predicts where an ad loses people against your category's top performers.",
    imageSide: "right",
    filmstripSrc: "/screenshots/signal-filmstrip.png",
    filmstripWidth: 1300,
    filmstripHeight: 2060,
    highlights: [
      {
        label: "Best-practice scoring",
        description: "Every asset checked tier by tier against format-specific criteria.",
        dotClassName: "bg-accent-blue",
        glowClassName: "bg-accent-blue/15",
        screenshotAlt: "Signal best-practice score report with a tier one structural checklist of pass, partial, and fail results",
        zoomOffsetY: 0,
        zoomHeight: 792,
      },
      {
        label: "Predicted retention",
        description: "See where an ad loses people, benchmarked against category top performers.",
        dotClassName: "bg-accent-violet",
        glowClassName: "bg-accent-violet/15",
        screenshotAlt: "Signal predicted retention curve compared against category top quartile, with a recommended top fix",
        zoomOffsetY: 816,
        zoomHeight: 615,
      },
      {
        label: "Batch review",
        description: "Score a whole round of creative at once, sorted and ready to run.",
        dotClassName: "bg-accent-coral",
        glowClassName: "bg-accent-coral/15",
        screenshotAlt: "Signal batch summary showing a sorted grid of scored ad creative assets ready to run",
        zoomOffsetY: 1455,
        zoomHeight: 605,
      },
    ],
  },
];

export default function WhatWereBuilding() {
  return (
    <section id="building" className="relative py-28">
      <SectionProgress targetId="building" />
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
