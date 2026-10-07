"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import styles from "./app.module.css";
import { Icon } from "./icons";

// Centered dialog: title bar with close, scrolling body, optional footer.
export function Modal({
  title,
  onClose,
  width = 480,
  busy,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  width?: number;
  busy?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <div className={styles.overlay} onClick={() => !busy && onClose()}>
      <div
        className={styles.modal}
        style={{ "--w": `${width}px` } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className={styles.iconBtn} style={{ width: 32, height: 32 }} disabled={busy}>
            <Icon name="close" size={14} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFoot}>{footer}</div>}
      </div>
    </div>
  );
}
