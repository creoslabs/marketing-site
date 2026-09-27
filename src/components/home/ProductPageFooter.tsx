import Link from "next/link";
import { headers } from "next/headers";
import styles from "./home.module.css";
import { serverProductHref } from "@/lib/product-links";

// Same visual language as the homepage's footer, but every link is
// cross-subdomain-aware — see ProductPageHeader for why.
export async function ProductPageFooter() {
  const headerList = await headers();
  const rootHref = serverProductHref(headerList, "root", "/");
  const outlierHref = serverProductHref(headerList, "root", "/#outlier");
  const signalHref = serverProductHref(headerList, "root", "/#signal");
  const customHref = serverProductHref(headerList, "root", "/#custom");
  const aboutHref = serverProductHref(headerList, "root", "/about");
  const insightsHref = serverProductHref(headerList, "root", "/insights");

  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div>
          <Link href={rootHref} className={styles.logo} style={{ color: "var(--ink)" }}>
            CREOS LABS<sup>®</sup>
          </Link>
          <p style={{ marginTop: 10 }}>Marketing technology, built by marketers.</p>
          <p style={{ marginTop: 4 }}>© {new Date().getFullYear()} Creos Labs</p>
        </div>
        <div className={styles.cols}>
          <div>
            <b>Products</b>
            <Link href={outlierHref}>Outlier</Link>
            <Link href={signalHref}>Signal</Link>
            <Link href={customHref}>Custom</Link>
          </div>
          <div>
            <b>Company</b>
            <Link href={aboutHref}>About</Link>
            <Link href={insightsHref}>Insights</Link>
            <a href="mailto:hello@creos-labs.com">hello@creos-labs.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
