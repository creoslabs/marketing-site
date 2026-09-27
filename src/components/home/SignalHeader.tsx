"use client";

import Link from "next/link";
import styles from "./home.module.css";
import { useProductHref } from "@/lib/use-product-href";

// Signal's own dedicated header — see OutlierHeader for why the logo and
// "Log in" need cross-subdomain resolution while the nav items don't.
export function SignalHeader() {
  const rootHref = useProductHref("root", "/");
  const loginHref = useProductHref("root", "/login");

  return (
    <header className={`${styles.wrap} ${styles.top}`}>
      <Link href={rootHref} className={styles.logoLockup}>
        <span className={styles.logo}>
          CREOS LABS<sup>®</sup>
        </span>
        <span className={styles.logoDivider}>/</span>
        <span className={styles.logo}>SIGNAL</span>
      </Link>
      <nav className={styles.nav} aria-label="Main">
        <a href="#how">How it works</a>
        <a href="#demo">Breakdown</a>
        <a href="#round">Review a round</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className={styles.actions}>
        <Link href={loginHref} className={styles.login}>
          Log in
        </Link>
        <a className={styles.btn} href="#pricing">
          Get Signal
        </a>
      </div>
    </header>
  );
}
