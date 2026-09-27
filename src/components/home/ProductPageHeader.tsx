"use client";

import Link from "next/link";
import styles from "./home.module.css";
import { useProductHref, useLandingHref } from "@/lib/use-product-href";

// Same visual language as the homepage's header, but every link is
// cross-subdomain-aware: this renders both at www.creos-labs.com/products/X
// and, unauthenticated, right at outlier./signal.<host>/ (the subdomain's
// own landing page) — so "Pricing"/"Log in"/the other product all need to
// leave the current origin instead of resolving as in-page anchors.
export function ProductPageHeader() {
  const rootHref = useProductHref("root", "/");
  const outlierHref = useLandingHref("outlier");
  const signalHref = useLandingHref("signal");
  const pricingHref = useProductHref("root", "/#pricing");
  const customHref = useProductHref("root", "/#custom");
  const insightsHref = useProductHref("root", "/insights");
  const loginHref = useProductHref("root", "/login");

  return (
    <header className={`${styles.wrap} ${styles.top}`}>
      <Link href={rootHref} className={styles.logo}>
        CREOS LABS<sup>®</sup>
      </Link>
      <nav className={styles.nav} aria-label="Main">
        <Link href={outlierHref}>Outlier</Link>
        <Link href={signalHref}>Signal</Link>
        <Link href={pricingHref}>Pricing</Link>
        <Link href={customHref}>Custom</Link>
        <Link href={insightsHref}>Insights</Link>
      </nav>
      <div className={styles.actions}>
        <Link href={loginHref} className={styles.login}>
          Log in
        </Link>
        <Link className={styles.btn} href={pricingHref}>
          Get Creos
        </Link>
      </div>
    </header>
  );
}
