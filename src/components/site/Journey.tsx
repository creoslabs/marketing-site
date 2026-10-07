import type { ReactNode } from "react";
import styles from "./site.module.css";
import { Asterisk, Mono } from "./ui";

export type JourneyStage = { label: string; card: ReactNode; caption: string };

// The "journey" track: one asset moving through four stages. A horizontal
// four-column track on wide screens, a vertical rail on small ones — same
// markup, the layout swaps in CSS.
export function Journey({ title, stages }: { title: string; stages: JourneyStage[] }) {
  return (
    <div className={styles.journey}>
      <div className={styles.journeyHead}>
        <Mono>{title}</Mono>
        <Asterisk size={20} className={styles.asterisk} />
      </div>
      <div className={styles.journeyTrack}>
        <span className={styles.journeyLine} aria-hidden="true" />
        <ol className={styles.journeyList}>
          {stages.map((stage, i) => {
            const last = i === stages.length - 1;
            return (
              <li key={stage.label} className={`${styles.stage} ${last ? styles.stageLast : ""}`}>
                <span className={`${styles.stageDot} ${last ? styles.stageDotLast : ""}`} aria-hidden="true" />
                <span className={styles.stageRail} aria-hidden="true" />
                <div className={styles.stageBody}>
                  <span className={`${styles.mono} ${styles.stageLabel}`}>{stage.label}</span>
                  <div className={styles.stageCard}>{stage.card}</div>
                  <span className={styles.stageCap}>{stage.caption}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
