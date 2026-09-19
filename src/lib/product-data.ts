import type { ProductData } from "@/components/ProductShowcase";

// Shared between the homepage's product showcase and each product's own
// dedicated marketing page (/products/outlier, /products/signal), so the
// screenshots and copy can't drift between the two.
export const OUTLIER_PRODUCT: ProductData = {
  name: "Outlier",
  tagline: "Find what's outperforming.",
  description:
    "Track creators and content in your space, identify posts performing above their normal baseline, and understand the patterns behind them.",
  href: "/products/outlier",
  ctaLabel: "Explore Outlier →",
  imageSide: "left",
  filmstripSrc: "/screenshots/outlier-filmstrip.png",
  filmstripWidth: 1300,
  filmstripHeight: 2490,
  highlights: [
    {
      label: "Track",
      description: "Every post scored against your own running median, not a vanity benchmark.",
      dotClassName: "bg-accent-blue",
      glowClassName: "bg-accent-blue/25",
      screenshotAlt: "Outlier creator detail view showing views-per-post over time and a scored list of posts",
      zoomOffsetY: 0,
      zoomHeight: 910,
      spotlightRect: { top: 13, left: 5, width: 27, height: 6 },
    },
    {
      label: "Detect",
      description: "Every tracked creator's posts in one feed — sorted by score, filtered by platform, live the moment you pull.",
      dotClassName: "bg-accent-violet",
      glowClassName: "bg-accent-violet/25",
      screenshotAlt: "Outlier feed showing ranked posts across every tracked creator with sort and platform filters",
      zoomOffsetY: 910,
      zoomHeight: 580,
      spotlightRect: { top: 24, left: 2, width: 97, height: 60 },
    },
    {
      label: "Understand",
      description: "Auto-transcribed and broken into beats and hook style, so you see why a post worked, not just that it did.",
      dotClassName: "bg-accent-coral",
      glowClassName: "bg-accent-coral/25",
      screenshotAlt: "Outlier video detail view with an auto-generated transcript and hook structure breakdown",
      zoomOffsetY: 1490,
      zoomHeight: 1000,
      spotlightRect: { top: 24, left: 26, width: 46, height: 22 },
    },
  ],
};

export const SIGNAL_PRODUCT: ProductData = {
  name: "Signal",
  tagline: "Analyse before you publish.",
  description: "Upload creative and get structured feedback on the elements that influence attention, clarity and performance.",
  href: "/products/signal",
  ctaLabel: "Explore Signal →",
  imageSide: "right",
  filmstripSrc: "/screenshots/signal-filmstrip.png",
  filmstripWidth: 1300,
  filmstripHeight: 2270,
  highlights: [
    {
      label: "Score",
      description: "Every asset checked tier by tier against format-specific criteria.",
      dotClassName: "bg-accent-blue",
      glowClassName: "bg-accent-blue/25",
      screenshotAlt: "Signal best-practice score report with a tier one structural checklist of pass, partial, and fail results",
      zoomOffsetY: 0,
      zoomHeight: 1100,
      spotlightRect: { top: 13, left: 20, width: 39, height: 9 },
    },
    {
      label: "Benchmark",
      description: "Every score placed against every other asset you've analyzed in that format, so a number means something concrete.",
      dotClassName: "bg-accent-violet",
      glowClassName: "bg-accent-violet/25",
      screenshotAlt: "Signal benchmarks page comparing static and video assets sorted by score against the format median",
      zoomOffsetY: 1100,
      zoomHeight: 470,
      spotlightRect: { top: 34, left: 1, width: 98, height: 30 },
    },
    {
      label: "Review",
      description: "Upload a whole round of creative at once and see every score land side by side.",
      dotClassName: "bg-accent-coral",
      glowClassName: "bg-accent-coral/25",
      screenshotAlt: "Signal library showing a grid of scored ad creative assets from a batch upload",
      zoomOffsetY: 1570,
      zoomHeight: 700,
      spotlightRect: { top: 66, left: 1, width: 30, height: 33 },
    },
  ],
};
