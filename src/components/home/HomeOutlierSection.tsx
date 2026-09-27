import styles from "./home.module.css";
import { OutlierDemoPanel } from "./OutlierDemoPanel";

export function HomeOutlierSection() {
  return (
    <section className={`${styles.deep} ${styles.sec}`} id="outlier">
      <div className={`${styles.wrap} ${styles.secHead}`}>
        <span className={styles.label}>
          Outlier <span className={styles.status}>Live, early access</span>
        </span>
        <h2 className={styles.display}>
          <span>Your competitors</span>
          <span>are telling you</span>
          <span>what works.</span>
        </h2>
        <div className={styles.intro}>
          <p>
            Track the creators and brands in your space. Every post is scored against its own running median, so you
            see what&rsquo;s breaking out while it&rsquo;s still climbing.
          </p>
          <a href="/products/outlier">
            Explore Outlier <span className={styles.arrow}>↗</span>
          </a>
        </div>
      </div>

      <OutlierDemoPanel />
    </section>
  );
}
