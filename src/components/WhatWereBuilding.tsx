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
    filmstripHeight: 2490,
    highlights: [
      {
        label: "Outlier Score",
        description: "Every post scored against your own running median, not a vanity benchmark.",
        dotClassName: "bg-accent-blue",
        glowClassName: "bg-accent-blue/15",
        screenshotAlt: "Outlier creator detail view showing views-per-post over time and a scored list of posts",
        zoomOffsetY: 0,
        zoomHeight: 910,
      },
      {
        label: "Feed, ranked",
        description: "Every tracked creator's posts in one feed — sorted by score, filtered by platform, live the moment you pull.",
        dotClassName: "bg-accent-violet",
        glowClassName: "bg-accent-violet/15",
        screenshotAlt: "Outlier feed showing ranked posts across every tracked creator with sort and platform filters",
        zoomOffsetY: 910,
        zoomHeight: 580,
      },
      {
        label: "Structure, not just stats",
        description: "Auto-transcribed and broken into beats and hook style, so you see why a post worked, not just that it did.",
        dotClassName: "bg-accent-coral",
        glowClassName: "bg-accent-coral/15",
        screenshotAlt: "Outlier video detail view with an auto-generated transcript and hook structure breakdown",
        zoomOffsetY: 1490,
        zoomHeight: 1000,
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
    filmstripHeight: 2270,
    highlights: [
      {
        label: "Best-practice scoring",
        description: "Every asset checked tier by tier against format-specific criteria.",
        dotClassName: "bg-accent-blue",
        glowClassName: "bg-accent-blue/15",
        screenshotAlt: "Signal best-practice score report with a tier one structural checklist of pass, partial, and fail results",
        zoomOffsetY: 0,
        zoomHeight: 1100,
      },
      {
        label: "Benchmarked, not guessed",
        description: "Every score placed against every other asset you've analyzed in that format, so a number means something concrete.",
        dotClassName: "bg-accent-violet",
        glowClassName: "bg-accent-violet/15",
        screenshotAlt: "Signal benchmarks page comparing static and video assets sorted by score against the format median",
        zoomOffsetY: 1100,
        zoomHeight: 470,
      },
      {
        label: "Batch review",
        description: "Upload a whole round of creative at once and see every score land side by side.",
        dotClassName: "bg-accent-coral",
        glowClassName: "bg-accent-coral/15",
        screenshotAlt: "Signal library showing a grid of scored ad creative assets from a batch upload",
        zoomOffsetY: 1570,
        zoomHeight: 700,
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
            Live now, in early access
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Two tools. Already doing the work.
          </p>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted">
            Not just surface-level stats, but the craft and structure
            underneath what actually performs — scoring real creator posts
            and real ad creative for the marketers using them today.
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
