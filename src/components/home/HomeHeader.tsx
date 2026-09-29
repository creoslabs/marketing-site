import Link from "next/link";
import styles from "./home.module.css";
import { HomeThemeToggle } from "./HomeThemeToggle";

export function HomeHeader() {
  return (
    <header className={`${styles.wrap} ${styles.top}`}>
      <Link href="/" className={styles.logo}>
        CREOS LABS<sup>®</sup>
      </Link>
      <nav className={styles.nav} aria-label="Main">
        <a href="#outlier">Outlier</a>
        <a href="#signal">Signal</a>
        <a href="#pricing">Pricing</a>
        <a href="#custom">Custom</a>
        <Link href="/insights">Insights</Link>
      </nav>
      <div className={styles.actions}>
        <HomeThemeToggle />
        <Link href="/login" className={styles.login}>
          Log in
        </Link>
        <a className={styles.btn} href="#pricing">
          Get Creos
        </a>
      </div>
    </header>
  );
}
