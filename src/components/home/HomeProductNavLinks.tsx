"use client";

import { useLandingHref } from "@/lib/use-product-href";

// Outlier and Signal live on their own subdomains once active — these two
// nav items need to resolve to the real subdomain landing page rather than
// scrolling to the in-page section, so they need the client-side host check
// useLandingHref does. Kept as a small standalone client component (like
// HomeThemeToggle) so the rest of HomeHeader can stay a Server Component.
export function HomeProductNavLinks() {
  const outlierHref = useLandingHref("outlier");
  const signalHref = useLandingHref("signal");

  return (
    <>
      <a href={outlierHref}>Outlier</a>
      <a href={signalHref}>Signal</a>
    </>
  );
}
