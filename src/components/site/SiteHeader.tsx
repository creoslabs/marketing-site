"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import styles from "./site.module.css";
import { BrandLockup } from "@/components/brand";
import { ENQUIRE_HREF, cx } from "./ui";
import { useProductHref, useDashboardHref } from "@/lib/use-product-href";

type Product = "outlier" | "signal";

const PRODUCT_NAV: Record<Product, Array<{ href: string; label: string }>> = {
  outlier: [
    { href: "#how", label: "How it works" },
    { href: "#score", label: "The score" },
    { href: "#feed", label: "Feed" },
    { href: "#access", label: "Early access" },
    { href: "#faq", label: "FAQ" },
  ],
  signal: [
    { href: "#how", label: "How it works" },
    { href: "#demo", label: "Breakdown" },
    { href: "#round", label: "Review a round" },
    { href: "#access", label: "Early access" },
    { href: "#faq", label: "FAQ" },
  ],
};

const HOME_NAV = [
  { href: "#products", label: "Products" },
  { href: "#services", label: "Services" },
  { href: "#how", label: "How it works" },
];

// One header for all three pages. With no `product` it's the homepage nav;
// with one it's that product's own lockup ("CREOS LABS® / OUTLIER") and nav.
// Below 900px the nav collapses into the menu button.
export function SiteHeader({ product, isLoggedIn = false, fromRoot = false }: { product?: Product; isLoggedIn?: boolean; fromRoot?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootHref = useProductHref("root", "/");
  const loginHref = useProductHref("root", "/login");
  const dashboardHref = useDashboardHref(product ?? "outlier");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const label = product === "outlier" ? "Outlier" : "Signal";
  // Pages other than the homepage (legal, etc.) point the section links back at "/".
  const nav = product ? PRODUCT_NAV[product] : fromRoot ? HOME_NAV.map((n) => ({ ...n, href: `/${n.href}` })) : HOME_NAV;
  const cta = product ? { href: "#access", label: "Request access" } : { href: ENQUIRE_HREF, label: "Start a project" };

  return (
    <>
      <header className={cx(styles.wrap, styles.header, product && styles.headerProd)}>
        {product ? (
          <Link href={rootHref} className={styles.lockup} aria-label="Creos Labs home">
            <BrandLockup className={styles.lockImg} />
            <span className={styles.lockSlash} aria-hidden="true">
              /
            </span>
            <span className={cx(styles.disp, styles.productName)}>{label}</span>
          </Link>
        ) : fromRoot ? (
          // Pages other than the homepage (legal, etc.): the logo goes home.
          <Link href={rootHref} className={cx(styles.lockup, styles.lockupHome)} aria-label="Creos Labs home">
            <BrandLockup className={cx(styles.lockImg, styles.lockImgHome)} />
          </Link>
        ) : (
          <a href="#top" className={cx(styles.lockup, styles.lockupHome)} aria-label="Creos Labs home">
            <BrandLockup className={cx(styles.lockImg, styles.lockImgHome)} />
          </a>
        )}

        {product ? (
          <>
            <nav className={styles.nav} aria-label="Main">
              {nav.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </nav>
            <div className={styles.actions}>
              <Link href={isLoggedIn ? dashboardHref : loginHref}>{isLoggedIn ? "Dashboard" : "Log in"}</Link>
              <a href={cta.href} className={styles.navCta}>
                {cta.label}
              </a>
            </div>
          </>
        ) : (
          <nav className={cx(styles.nav, styles.navHome)} aria-label="Main">
            {nav.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
            <a href={cta.href} className={styles.navCta}>
              {cta.label}
            </a>
          </nav>
        )}

        <button
          type="button"
          className={styles.menuBtn}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F2F0EA"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </header>

      {open && (
        <nav id={panelId} className={styles.menuPanel} aria-label="Menu">
          {nav.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>
              {l.label}
            </a>
          ))}
          {product && (
            <Link href={isLoggedIn ? dashboardHref : loginHref} onClick={close}>
              {isLoggedIn ? "Dashboard" : "Log in"}
            </Link>
          )}
          <a href={cta.href} className={styles.menuCta} onClick={close}>
            {cta.label}
          </a>
        </nav>
      )}
    </>
  );
}
