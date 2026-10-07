"use client";

import type { ReactNode } from "react";
import styles from "./app.module.css";
import { cx } from "./ui";

// role="switch" with aria-checked; accent when on.
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cx(styles.switch, checked && styles.switchOn)}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switchKnob} />
    </button>
  );
}

// role="radiogroup"; the selected option uses the paper fill.
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: ReactNode }>;
  onChange: (next: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={styles.seg}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={styles.segBtn}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
