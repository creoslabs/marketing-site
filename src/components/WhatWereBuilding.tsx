import Image from "next/image";
import { Reveal } from "@/components/Reveal";

const PRODUCTS = [
  {
    name: "Outlier",
    tagline: "Track what's actually working across your niche.",
    description:
      "Outlier scores every post against your own running median, then surfaces the topics and hook styles converting above the norm across the creators you track — so you know what's worth repurposing, not just what already went viral.",
    screenshot: "/screenshots/outlier.png",
    screenshotAlt:
      "Outlier creator detail view showing views-per-post over time and a scored list of posts",
    screenshotWidth: 1524,
    screenshotHeight: 1094,
    imageSide: "left" as const,
    highlights: [
      {
        label: "Outlier Score",
        description: "Every post scored against your own running median, not a vanity benchmark.",
        dotClassName: "bg-accent-blue",
      },
      {
        label: "Topics running hot",
        description: "See which topics and hook styles are converting above median across every creator you track.",
        dotClassName: "bg-accent-violet",
      },
      {
        label: "Worth repurposing",
        description: "Patterns proven to work elsewhere, flagged before your niche catches on.",
        dotClassName: "bg-accent-coral",
      },
    ],
  },
  {
    name: "Signal",
    tagline: "Know why an ad works before you spend to find out.",
    description:
      "Signal scores static and video ad creative against best-practice criteria — structural checks like safe zones and hook timing, contextual calls like framing and clarity — then predicts where an ad loses people against your category's top performers.",
    screenshot: "/screenshots/signal.png",
    screenshotAlt:
      "Signal video ad report showing a predicted retention curve against category top quartile, with a recommended top fix",
    screenshotWidth: 1300,
    screenshotHeight: 615,
    imageSide: "right" as const,
    highlights: [
      {
        label: "Best-practice scoring",
        description: "Every asset checked tier by tier against format-specific criteria.",
        dotClassName: "bg-accent-blue",
      },
      {
        label: "Predicted retention",
        description: "See where an ad loses people, benchmarked against category top performers.",
        dotClassName: "bg-accent-violet",
      },
      {
        label: "Batch review",
        description: "Score a whole round of creative at once, sorted and ready to run.",
        dotClassName: "bg-accent-coral",
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
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div
                  className={
                    product.imageSide === "right"
                      ? "lg:order-2"
                      : "lg:order-1"
                  }
                >
                  <div className="relative">
                    <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-accent-blue/10 blur-3xl" />
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/50">
                      <div className="flex items-center gap-1.5 border-b border-black/10 bg-[#f5f5f7] px-4 py-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                      </div>
                      <Image
                        src={product.screenshot}
                        alt={product.screenshotAlt}
                        width={product.screenshotWidth}
                        height={product.screenshotHeight}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={
                    product.imageSide === "right" ? "lg:order-1" : "lg:order-2"
                  }
                >
                  <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {product.name}
                  </p>

                  <div className="mt-3 flex">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
                      In development — coming soon
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-medium text-accent-blue">
                    {product.tagline}
                  </p>

                  <p className="mt-4 max-w-xl leading-relaxed text-muted">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {product.highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-surface p-6"
                  >
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${item.dotClassName}`}
                    />
                    <h3 className="mt-4 text-lg font-semibold tracking-tight">
                      {item.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
