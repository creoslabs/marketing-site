// A short, hand-maintained list of real shipped changes — update this when
// something genuinely new ships, not on every commit. The dismissible
// "what's new" card shows only the latest entry, keyed by id, so it
// reappears once (and only once) after a new one is added.
export const CHANGELOG = [
  {
    id: "2026-09-repurpose-collections",
    title: "New: Repurpose scripts, collections, and cross-creator benchmarking",
    description:
      "Turn any analyzed outlier into an original script for your own content, organize favourites into named collections, and see which of your tracked creators is actually outperforming.",
  },
] as const;

export function getLatestChangelogEntry() {
  return CHANGELOG[0];
}
