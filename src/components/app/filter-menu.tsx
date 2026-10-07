"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./app.module.css";
import { Icon } from "./icons";
import { cx } from "./ui";

// A pill button that opens a short list of options — used for the feed's
// creator / hook style / date range / sort filters. Selecting closes it.
export function FilterMenu<T extends string>({
  label,
  value,
  options,
  onChange,
  prefix,
  align = "left",
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (next: T) => void;
  prefix?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value)?.label ?? label;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className={cx(styles.btn, styles.btnSm, styles.btnGhost)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          {prefix}
          {current}
        </span>
        <Icon name="chevronDown" />
      </button>
      {open && (
        <div className={cx(styles.menu, align === "left" && styles.menuLeft)} role="listbox" style={{ maxHeight: 320, overflowY: "auto", minWidth: 200 }}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={styles.menuItem}
              style={o.value === value ? { color: "var(--ws-accent)" } : undefined}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
              {o.value === value && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
