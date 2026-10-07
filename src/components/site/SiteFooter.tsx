"use client";

import Link from "next/link";
import styles from "./site.module.css";
import { Asterisk, ENQUIRE_HREF, Wordmark, cx } from "./ui";
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
  const outlierHref = useLandingHref("outlier");
  const signalHref = useLandingHref("signal");

  if (variant === "home") {
    return (
      <footer className={styles.footer}>
        <div className={cx(styles.wrap, styles.footerHome)}>
          <div className={styles.footerTop}>
            <div className={styles.bigMark}>
              <Asterisk size={112} className={styles.bigAsterisk} />
              <Wordmark className={styles.bigMarkText} />
            </div>
            <nav className={styles.footNav} aria-label="Footer">
              <a href="#products">Products</a>
              <a href="#services">Services</a>
              <a href={ENQUIRE_HREF}>Contact</a>
            </nav>
          </div>
          <div className={styles.footMeta}>
            <span>Marketing, engineered.</span>
            <span className={styles.mono}>© {YEAR} Creos Labs · creos-labs.com</span>
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
              <Asterisk size={52} className={styles.footAsterisk} />
              <Wordmark className={styles.footBrandText} />
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
          </div>
        </div>
        <span className={cx(styles.mono, styles.footCopy)}>© {YEAR} Creos Labs</span>
      </div>
    </footer>
  );
}
