// A short, hand-maintained list of real shipped changes — update this when
// something genuinely new ships, not on every commit. The dismissible
// announcement bar shows only the latest entry, keyed by id, so it
// reappears once (and only once) after a new one is added.
export const CHANGELOG = [
  {
    id: "2026-09-repurpose-collections",
    summary: "Repurpose scripts, collections and cross-creator benchmarking are live.",
    cta: "Find a post to repurpose",
    href: "/outlier/feed",
  },
] as const;

export function getLatestChangelogEntry() {
  return CHANGELOG[0];
}
