import type { ReactNode } from "react";
import styles from "./app.module.css";
import { cx } from "./ui";

// A titled settings block: intro on the left, bordered rows on the right.
export function SettingsSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className={styles.setSection}>
      <div className={styles.setIntro}>
        <span className={cx(styles.mono, styles.setTitle)}>{title}</span>
        {description && <span className={styles.setDesc}>{description}</span>}
      </div>
      <div className={styles.setCard}>{children}</div>
    </section>
  );
}

// Label / value / action row. Actions are underlined text buttons.
export function SettingsRow({ label, children, action, muted }: { label: string; children?: ReactNode; action?: ReactNode; muted?: boolean }) {
  return (
    <div className={styles.setRow}>
      <span className={styles.setKey}>{label}</span>
      <span className={styles.setVal} style={muted ? { color: "var(--ws-ink-45)" } : undefined}>
        {children}
      </span>
      {action}
    </div>
  );
}
