"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

// Illustrative example of what Outlier's feed surfaces and what Signal
// detects in a creative — demo content in the same spirit as the filmstrip
// screenshots already used on the product pages, not a claim about Creos
// Labs' own usage.
export function HomeHero() {
  const [velocity, setVelocity] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const path = pathRef.current;
    if (reduce || !path) {
      setVelocity(842);
      return;
    }
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const t0 = performance.now();
    const dur = 1600;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setVelocity(Math.round(842 * e));
      path.style.strokeDashoffset = `${len * (1 - e)}`;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={`${styles.wrap} ${styles.heroGrid}`}>
        <div>
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

        <aside className={styles.feed} aria-label="Example live intelligence feed">
          <div className={`${styles.feedHead} ${styles.label}`}>
            <span className={styles.live} aria-hidden="true" />
            Live intelligence
          </div>
          <div className={styles.entry}>
            <span className={styles.label}>01 / Viral content</span>
            <p className={`${styles.big} ${styles.bigNum}`}>+{velocity}%</p>
            <p className={styles.meta}>
              Velocity. Competitor post accelerating,
              <br />
              1.4M to 12.6M views in 4 days.
            </p>
            <svg className={styles.spark} viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
              <path ref={pathRef} d="M0 56 C60 55 110 53 150 48 S220 30 250 16 S290 3 300 2" />
            </svg>
          </div>
          <div className={styles.entry}>
            <span className={styles.label}>02 / Ad creative</span>
            <p className={`${styles.big} ${styles.bigWord}`}>Hook detected</p>
            <p className={styles.meta}>Problem → demonstration → proof</p>
            <div className={styles.chain} aria-hidden="true">
              <div />
              <div />
              <div />
            </div>
            <div className={styles.chainL} aria-hidden="true">
              <span>0–3 s</span>
              <span>3–9 s</span>
              <span>9–15 s</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
