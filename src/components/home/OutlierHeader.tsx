"use client";

import Link from "next/link";
import styles from "./home.module.css";
import { useProductHref } from "@/lib/use-product-href";

// Outlier's own dedicated header — nav items are in-page anchors (this is a
// single long page), but the logo and "Log in" leave the current origin
// entirely, so those two still need cross-subdomain resolution.
export function OutlierHeader() {
  const rootHref = useProductHref("root", "/");
  const loginHref = useProductHref("root", "/login");

  return (
    <header className={`${styles.wrap} ${styles.top}`}>
      <Link href={rootHref} className={styles.logoLockup}>
        <span className={styles.logo}>
          CREOS LABS<sup>®</sup>
        </span>
        <span className={styles.logoDivider}>/</span>
        <span className={styles.logo}>OUTLIER</span>
      </Link>
      <nav className={styles.nav} aria-label="Main">
        <a href="#how">How it works</a>
        <a href="#score">The score</a>
        <a href="#feed">Feed</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className={styles.actions}>
        <Link href={loginHref} className={styles.login}>
          Log in
        </Link>
        <a className={styles.btn} href="#pricing">
          Get Outlier
        </a>
      </div>
    </header>
  );
}
