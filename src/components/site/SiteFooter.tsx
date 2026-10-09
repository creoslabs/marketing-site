"use client";

import Link from "next/link";
import styles from "./site.module.css";
import { BrandLockup } from "@/components/brand";
import { ENQUIRE_HREF, cx } from "./ui";
import { useProductHref, useLandingHref } from "@/lib/use-product-href";

const YEAR = 2026;

// Homepage footer: oversized wordmark and the three in-page anchors.
// Product footer: brand block plus Products / Company columns, whose links
// leave the current subdomain and so need cross-origin resolution.
export function SiteFooter({ variant }: { variant: "home" | "product" }) {
  const rootHref = useProductHref("root", "/");
  const servicesHref = useProductHref("root", "/#services");
  const aboutHref = useProductHref("root", "/about");
  const insightsHref = useProductHref("root", "/insights");
  const privacyHref = useProductHref("root", "/privacy");
  const termsHref = useProductHref("root", "/terms");
  const cookiesHref = useProductHref("root", "/cookies");
  const outlierHref = useLandingHref("outlier");
  const signalHref = useLandingHref("signal");

  if (variant === "home") {
    return (
      <footer className={styles.footer}>
        <div className={cx(styles.wrap, styles.footerHome)}>
          <div className={styles.footerTop}>
            <div className={styles.bigMark}>
              <BrandLockup className={styles.bigLockup} />
            </div>
            <nav className={styles.footNav} aria-label="Footer">
              <a href="#products">Products</a>
              <a href="#services">Services</a>
              <a href={ENQUIRE_HREF}>Contact</a>
            </nav>
          </div>
          <div className={styles.footMeta}>
            <span>Marketing, engineered.</span>
            <span className={cx(styles.mono, styles.footLegal)}>
              <Link href={privacyHref}>Privacy</Link>
              <Link href={termsHref}>Terms</Link>
              <Link href={cookiesHref}>Cookies</Link>
              <span>© {YEAR} Creos Labs · creos-labs.com</span>
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={cx(styles.wrap, styles.footerProd)}>
        <div className={styles.footProdTop}>
          <div className={styles.footBrand}>
            <Link href={rootHref} className={styles.footBrandRow} aria-label="Creos Labs home">
              <BrandLockup className={styles.footLockup} />
            </Link>
            <span className={styles.footTag}>Marketing technology, built by marketers.</span>
          </div>
          <div className={styles.footCols}>
            <div className={styles.footCol}>
              <span className={styles.mono}>Products</span>
              <a href={outlierHref}>Outlier</a>
              <a href={signalHref}>Signal</a>
              <Link href={servicesHref}>Custom</Link>
            </div>
            <div className={styles.footCol}>
              <span className={styles.mono}>Company</span>
              <Link href={aboutHref}>About</Link>
              <Link href={insightsHref}>Insights</Link>
              <a href="mailto:hello@creos-labs.com">hello@creos-labs.com</a>
            </div>
            <div className={styles.footCol}>
              <span className={styles.mono}>Legal</span>
              <Link href={privacyHref}>Privacy Policy</Link>
              <Link href={termsHref}>Terms of Use</Link>
              <Link href={cookiesHref}>Cookie Notice</Link>
            </div>
          </div>
        </div>
        <span className={cx(styles.mono, styles.footCopy)}>© {YEAR} Creos Labs</span>
      </div>
    </footer>
  );
}
