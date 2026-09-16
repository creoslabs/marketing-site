"use client";

import { useEffect, useSyncExternalStore } from "react";

export type ThemePreference = "dark" | "light" | "system";

const STORAGE_KEY = "ws-theme";
const listeners = new Set<() => void>();

function readStoredPreference(): ThemePreference | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : null;
  } catch {
    return null;
  }
}

function getSnapshot(): ThemePreference {
  return readStoredPreference() ?? "dark";
}

// SSR always renders "dark" (localStorage doesn't exist server-side);
// useSyncExternalStore reconciles this against the client's real snapshot
// after hydration without a hydration-mismatch warning — that's the whole
// point of the hook, unlike a plain useState+useEffect pair.
function getServerSnapshot(): ThemePreference {
  return "dark";
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

// localStorage's own "storage" event only fires in OTHER tabs, never the
// tab that made the write — so setTheme() notifies same-tab subscribers
// (every mounted useWsTheme()) directly.
function notify() {
  listeners.forEach((listener) => listener());
}

function resolveTheme(pref: ThemePreference): "dark" | "light" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

function applyTheme(theme: "dark" | "light") {
  document.querySelector(".ws")?.setAttribute("data-theme", theme);
}

// Applies the saved theme preference to the nearest .ws root on mount. This
// is needed in addition to each layout's blocking inline script: that script
// only executes on a hard page load (browsers don't run <script> tags that
// arrive via DOM patching), so it's inert on a client-side Link navigation
// between /workspace, /outlier and /signal — without this hook, switching
// between areas would silently drop back to the dark default.
//
// Supports "system", which stays live-synced to the OS preference for as
// long as it's selected (Signal's Appearance card; Workspace/Outlier only
// ever set "dark"/"light" but still resolve "system" correctly if it was
// set elsewhere, since the preference is shared across all three areas).
export function useWsTheme() {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyTheme(resolveTheme(preference));
    if (preference !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(resolveTheme("system"));
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [preference]);

  function setTheme(next: ThemePreference) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — private browsing etc.
    }
    notify();
  }

  return [preference, setTheme] as const;
}
