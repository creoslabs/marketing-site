"use client";

import Link from "next/link";
import styles from "./home.module.css";
import { useProductHref, useDashboardHref } from "@/lib/use-product-href";

// Signal's own dedicated header — see OutlierHeader for why the logo and
// "Log in"/"Dashboard" need cross-subdomain resolution while the nav items
// don't.
export function SignalHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const rootHref = useProductHref("root", "/");
  const loginHref = useProductHref("root", "/login");
  const dashboardHref = useDashboardHref("signal");

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
        {isLoggedIn ? (
          <Link href={dashboardHref} className={styles.login}>
            Dashboard
          </Link>
        ) : (
          <Link href={loginHref} className={styles.login}>
            Log in
          </Link>
        )}
        <a className={styles.btn} href="#pricing">
          Get Signal
        </a>
      </div>
    </header>
  );
}
