import styles from "./home.module.css";

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.wrap} ${styles.heroSingle}`}>
        <span className={styles.label}>Marketing intelligence / 2026</span>
        <h1 className={styles.display}>
          <span>See what</span>
          <span>others</span>
          <span>miss.</span>
        </h1>
        <p className={styles.lede}>
          <span>Competitive content intelligence.</span>
          <span>Ad creative intelligence.</span>
          <span>Custom marketing technology.</span>
        </p>
        <div className={styles.prod}>
          <a href="#outlier">
            OUTLIER <span className={styles.arrow}>↗</span>
          </a>
          <a href="#signal">
            SIGNAL <span className={styles.arrow}>↗</span>
          </a>
          <a href="#custom">
            CUSTOM <span className={styles.arrow}>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
