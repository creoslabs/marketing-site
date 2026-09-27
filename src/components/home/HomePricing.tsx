import { GetCreosForm } from "@/components/GetCreosForm";
import styles from "./home.module.css";

export function HomePricing() {
  return (
    <section className={`${styles.deep} ${styles.pricing}`} id="pricing">
      <div className={styles.wrap}>
        <h2 className={styles.display}>
          <span>One subscription.</span>
          <span>Every tool.</span>
        </h2>
        <div className={styles.plan}>
          <ul className={styles.rows}>
            <li>
              <b>Outlier</b>
              <span>Content intelligence</span>
              <em>Included</em>
            </li>
            <li>
              <b>Signal</b>
              <span>Creative analysis</span>
              <em>Included</em>
            </li>
            <li className={styles.rowsLab}>
              <b>???</b>
              <span>Something new is forming in the lab</span>
              <em>Included</em>
            </li>
          </ul>
          <div className={styles.price}>
            <small>Founding access</small>
            <p className={styles.amt}>
              A$15<span>/month</span>
            </p>
            <p>Your founding price stays yours while you&rsquo;re subscribed.</p>
            <div style={{ marginTop: 24 }}>
              <GetCreosForm />
            </div>
            <p style={{ fontSize: 13, marginTop: 16 }}>No lock-in. Cancel anytime.</p>
          </div>
        </div>
        <div className={styles.teams}>
          <span>Running Creos for multiple brands? We&rsquo;re working with selected teams and agencies.</span>
          <a href="mailto:hello@creos-labs.com?subject=Creos%20for%20teams">Talk to us</a>
        </div>
      </div>
    </section>
  );
}
