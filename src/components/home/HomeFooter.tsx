import Link from "next/link";
import styles from "./home.module.css";

export function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div>
          <Link href="/" className={styles.logo} style={{ color: "var(--ink)" }}>
            CREOS LABS<sup>®</sup>
          </Link>
          <p style={{ marginTop: 10 }}>Marketing technology, built by marketers.</p>
          <p style={{ marginTop: 4 }}>© {new Date().getFullYear()} Creos Labs</p>
        </div>
        <div className={styles.cols}>
          <div>
            <b>Products</b>
            <a href="#outlier">Outlier</a>
            <a href="#signal">Signal</a>
            <a href="#custom">Custom</a>
          </div>
          <div>
            <b>Company</b>
            <Link href="/about">About</Link>
            <Link href="/insights">Insights</Link>
            <a href="mailto:hello@creos-labs.com">hello@creos-labs.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
