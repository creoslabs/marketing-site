"use client";

import { useSyncExternalStore } from "react";
import { resolveProductHref, pathFallback, type ProductTarget } from "./product-links";

function subscribeNoop() {
  return () => {};
}

// React hook form for a Client Component's initial render — reads
// window.location without a hydration mismatch or an effect+setState (which
// the "no cascading renders" lint rule flags). getServerSnapshot supplies
// the SSR/first-paint fallback; React automatically re-renders once with
// the real client snapshot right after hydration. Split into its own
// client-only module so importing product-links.ts from a Server Component
// (for serverProductHref) doesn't pull useSyncExternalStore into the RSC graph.
export function useProductHref(target: ProductTarget, path: string): string {
  const host = useSyncExternalStore(
    subscribeNoop,
    () => window.location.host,
    () => null
  );
  if (host === null) return pathFallback(target, path);
  return resolveProductHref(host, window.location.protocol, target, path);
}
