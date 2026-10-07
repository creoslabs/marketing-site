"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import styles from "./app.module.css";
import { Icon } from "./icons";
import { Chip, cx } from "./ui";

export type Announcement = { id: string; label: string; text: string; href: string; cta: string };

const STORAGE_KEY = "ws-announcements-dismissed";
const EVENT_NAME = "ws-announcements-changed";

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT_NAME, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT_NAME, cb);
  };
}

// One "New" bar at a time, dismissible, instead of stacked banners: shows the
// first announcement (in priority order) that hasn't been dismissed on this
// device. Dismissals are per-device (localStorage), not per-account.
export function AnnouncementBar({ items }: { items: Announcement[] }) {
  const dismissed = useSyncExternalStore(subscribe, read, () => "__ssr__");
  if (dismissed === "__ssr__") return null;
  const ids = new Set(dismissed.split(",").filter(Boolean));
  const current = items.find((a) => !ids.has(a.id));
  if (!current) return null;

  function dismiss() {
    try {
      const next = [...ids, current!.id].join(",");
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch {
      // Private window / blocked storage — it will show again next visit.
    }
  }

  return (
    <div className={styles.announce} role="status">
      <Chip variant="accent">{current.label}</Chip>
      <span className={styles.announceText}>{current.text}</span>
      <Link href={current.href} className={styles.announceLink}>
        {current.cta} →
      </Link>
      <button type="button" className={cx(styles.announceClose)} aria-label="Dismiss" onClick={dismiss}>
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
