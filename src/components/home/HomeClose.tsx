import styles from "./home.module.css";

export function HomeClose() {
  return (
    <section className={styles.close}>
      <div className={styles.wrap}>
        <h2 className={styles.display}>
          <span>Build the brand.</span>
          <span>We&rsquo;ll build the tools.</span>
        </h2>
        <div className={styles.row}>
          <p>Outlier, Signal, and everything we&rsquo;re experimenting with next.</p>
          <a className={styles.btn} href="#pricing">
            Get Creos, A$15/month
          </a>
        </div>
      </div>
    </section>
  );
}
