"use client";

import styles from "./site.module.css";
import { useLandingHref } from "@/lib/use-product-href";

// "Try Signal →" / "Try Outlier →" — leaves the root domain for the product's
// own subdomain once those are live, and falls back to /products/<name>
// everywhere else (localhost, previews).
export function TryLink({ product, children }: { product: "outlier" | "signal"; children: React.ReactNode }) {
  const href = useLandingHref(product);
  return (
    <a href={href} className={styles.tryBtn}>
      {children}
    </a>
  );
}
