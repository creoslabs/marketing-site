import styles from "./home.module.css";
import { SignalDemoPanel } from "./SignalDemoPanel";

export function HomeSignalSection() {
  return (
    <section className={styles.sec} id="signal">
      <div className={`${styles.wrap} ${styles.secHead} ${styles.light}`}>
        <span className={styles.label}>
          Signal <span className={styles.status}>Live, early access</span>
        </span>
        <h2 className={styles.display}>
          <span>Your ads have</span>
          <span>more to say</span>
          <span>than ROAS.</span>
        </h2>
        <div className={styles.intro}>
          <p>
            Upload creative before you publish. Signal checks it beat by beat against what tends to hold attention,
            and benchmarks the score against everything you&rsquo;ve made before.
          </p>
          <a href="/products/signal">
            Explore Signal <span className={styles.arrow}>↗</span>
          </a>
        </div>
      </div>

      <SignalDemoPanel />
    </section>
  );
}
