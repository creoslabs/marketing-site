// Static per-product copy only. Live counts (assets analyzed, creators
// tracked, plan/usage/billing state) are computed from each product's own
// data layer in page.tsx and billing/page.tsx — nothing here is a number
// that could go stale or get faked.

export const PRODUCTS = [
  {
    key: "outlier",
    eyebrow: "CREATOR RESEARCH",
    name: "Outlier",
    description:
      "Tracks a watchlist of creators and scores every post against that creator's own median. Surfaces the hooks worth repurposing.",
    openHref: "/outlier",
    openLabel: "Open Outlier",
    secondaryHref: "/outlier/creators",
    secondaryLabel: "Watchlist",
  },
  {
    key: "signal",
    eyebrow: "AD ANALYSIS",
    name: "Signal",
    description:
      "Scores ad creative against a fixed criteria set per format, and flags every check a given asset fails.",
    openHref: "/signal",
    openLabel: "Open Signal",
    secondaryHref: "/signal/analyze",
    secondaryLabel: "Upload asset",
  },
];
