"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "outlier-next-step-dismissed";
const EVENT_NAME = "outlier-next-step-dismissed-event";

export type Suggestion = { id: string; title: string; description: string; href: string; cta: string };

// Native "storage" events only fire in *other* tabs — dismiss() below also
// fires a same-tab custom event so this tab's own render updates too.
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT_NAME, callback);
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
  return null;
}

// One suggestion at a time, chosen server-side from real usage (never
// fabricated — see computeNextStepSuggestion in page.tsx), dismissible
// per-device via localStorage. This deliberately doesn't re-appear once
// dismissed even if the underlying condition is still true — it's a
// one-time "have you tried this" nudge, not a recurring nag.
export function NextStepSuggestion({ suggestion }: { suggestion: Suggestion | null }) {
  const dismissedId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!suggestion || dismissedId === suggestion.id) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, suggestion!.id);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch {
      // ignore
    }
  }

  return (
    <div className="ws-card mb-[18px]" style={{ padding: "14px 18px" }}>
      <div className="flex items-start gap-[12px]">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold" style={{ color: "var(--ws-ink)" }}>
            {suggestion.title}
          </p>
          <p className="mt-[4px] text-[12px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
            {suggestion.description}
          </p>
          <Link href={suggestion.href} className="ws-link-accent mt-[8px] inline-block text-[12px] font-medium">
            {suggestion.cta} →
          </Link>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-[13px]" style={{ color: "var(--ws-ink-45)" }}>
          ✕
        </button>
      </div>
    </div>
  );
}
