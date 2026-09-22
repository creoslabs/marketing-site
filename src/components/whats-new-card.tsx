"use client";

import { useSyncExternalStore } from "react";
import { getLatestChangelogEntry } from "@/lib/changelog";

const STORAGE_KEY = "ws-whats-new-dismissed";

// Native "storage" events only fire in *other* tabs — dismiss() below also
// fires a same-tab custom event so this tab's own render updates too.
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("whats-new-dismissed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("whats-new-dismissed", callback);
  };
}
function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function getServerSnapshot() {
  return null; // no localStorage during SSR — assume not dismissed yet
}

// Per-device, not per-account — localStorage is the right call here since
// this is purely "have I already seen this on this browser," not state
// that needs to sync across devices or be readable by Claude/the server.
// useSyncExternalStore (not a plain effect) is the correct way to read an
// external store like this without a hydration-mismatch flash.
export function WhatsNewCard() {
  const entry = getLatestChangelogEntry();
  const dismissedId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dismissed = dismissedId === entry.id;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, entry.id);
      window.dispatchEvent(new Event("whats-new-dismissed"));
    } catch {
      // Private window / blocked storage — worst case it shows again next visit.
    }
  }

  if (dismissed) return null;

  return (
    <div className="ws-card mb-[18px]" style={{ padding: "14px 18px", borderColor: "var(--ws-accent-tint-border)" }}>
      <div className="flex items-start gap-[12px]">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            {entry.title}
          </p>
          <p className="mt-[4px] text-[12px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
            {entry.description}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-[13px]"
          style={{ color: "var(--ws-ink-45)" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
