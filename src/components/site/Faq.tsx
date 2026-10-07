import type { ReactNode } from "react";
import styles from "./site.module.css";
import { Eyebrow } from "./ui";

export type FaqItem = { q: string; a: ReactNode };

// Native <details>/<summary> — keyboard and screen-reader accessible with no
// script. The +/− mark is CSS-only and hidden from assistive tech.
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className={`${styles.faqSec} ${styles.secRule}`}>
      <div className={styles.wrap}>
        <div className={styles.faqRow}>
          <div className={styles.faqTitle}>
            <Eyebrow tone="dim">FAQ</Eyebrow>
            <h2 className={`${styles.disp} ${styles.h2}`}>Questions.</h2>
          </div>
          <div className={styles.faqList}>
            {items.map((item, i) => (
              <details key={item.q} className={styles.faqItem} open={i === 0}>
                <summary>
                  {item.q}
                  <span className={styles.faqMark} aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
