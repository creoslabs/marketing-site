// Placeholder account data. Billing state should eventually come from the
// payment provider (Stripe or similar) rather than being mirrored here —
// see design_handoff_creos_workspace/README.md.

export const PLAN = {
  name: "Studio",
  price: 79,
  renewsOn: "Oct 1",
  renewsOnFull: "Oct 1, 2026",
  periodLabel: "Sep 1 – Sep 30",
};

export const USAGE = [
  {
    key: "posts",
    shortLabel: "Posts pulled",
    label: "Posts pulled this period",
    used: 3200,
    limit: 5000,
    sub: "3,200 of 5,000 posts",
  },
  {
    key: "transcription",
    shortLabel: "Transcription",
    label: "Transcription minutes",
    used: 340,
    limit: 600,
    sub: "340 of 600 minutes",
  },
  {
    key: "assets",
    shortLabel: "Assets analyzed",
    label: "Assets analyzed",
    used: 87,
    limit: 150,
    sub: "87 of 150 assets",
  },
  {
    key: "storage",
    shortLabel: "Storage",
    label: "Storage used",
    used: 12,
    limit: 50,
    sub: "12 GB of 50 GB",
  },
];

export const PRODUCTS = [
  {
    key: "outlier",
    eyebrow: "CREATOR RESEARCH",
    name: "Outlier",
    description:
      "Tracks a watchlist of creators and scores every post against that creator's own median. Surfaces the hooks worth repurposing.",
    stats: [
      { label: "CREATORS", value: "18" },
      { label: "NEW OUTLIERS", value: "7" },
      { label: "BEST 24H", value: "6.4×" },
    ],
    openHref: "/outlier",
    openLabel: "Open Outlier",
    secondaryHref: "/outlier/creators",
    secondaryLabel: "Watchlist",
    status: "3 jobs running",
  },
  {
    key: "signal",
    eyebrow: "AD ANALYSIS",
    name: "Signal",
    description:
      "Scores ad creative against a fixed criteria set per format, and flags every check a given asset fails.",
    stats: [
      { label: "ASSETS", value: "87" },
      { label: "FAILING", value: "12", warn: true },
      { label: "LAST RUN", value: "2h" },
    ],
    openHref: "/signal",
    openLabel: "Open Signal",
    secondaryHref: "/signal/upload",
    secondaryLabel: "Upload asset",
    status: "Idle",
  },
];

export const INVOICES = [
  { id: "inv-3", date: "Sep 1, 2026", period: "Sep 1 – Sep 30", amount: "$79.00" },
  { id: "inv-2", date: "Aug 1, 2026", period: "Aug 1 – Aug 31", amount: "$79.00" },
  { id: "inv-1", date: "Jul 1, 2026", period: "Jul 1 – Jul 31", amount: "$79.00" },
];

export const PAYMENT_METHOD = { brand: "Visa", last4: "4429", expMonth: "03", expYear: "28" };
