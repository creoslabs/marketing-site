import styles from "./home.module.css";

export function HomeLoop() {
  return (
    <section className={styles.loop} aria-label="How Creos works">
      <div className={styles.wrap}>
        <div>
          <b>Research</b>
          <p>See what&rsquo;s outperforming in your niche.</p>
        </div>
        <div>
          <b>Analyse</b>
          <p>Check creative before you spend on it.</p>
        </div>
        <div>
          <b>Decide</b>
          <p>One clear answer, so the next move is obvious.</p>
        </div>
        <div>
          <b>Build</b>
          <p>When the tool doesn&rsquo;t exist, we make it.</p>
        </div>
      </div>
    </section>
  );
}
