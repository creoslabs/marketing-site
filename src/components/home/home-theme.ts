"use client";

import { useEffect, useSyncExternalStore } from "react";

export type HomeTheme = "dark" | "light";

const STORAGE_KEY = "home-theme";
const listeners = new Set<() => void>();

function readStored(): HomeTheme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function getSnapshot(): HomeTheme {
  return readStored() ?? "dark";
}

function getServerSnapshot(): HomeTheme {
  return "dark";
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

// [data-creos-home], not a class selector — .creosHome is a CSS Module
// class, so its runtime name is hashed and unusable as a plain query string.
function applyTheme(theme: HomeTheme) {
  document.querySelector("[data-creos-home]")?.setAttribute("data-theme", theme);
}

// Mirrors useWsTheme (src/components/ws-theme.ts): the layout's blocking
// inline script only runs on a hard load, so this hook re-applies the saved
// preference after a client-side Link navigation too.
export function useHomeTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function setTheme(next: HomeTheme) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — private browsing etc.
    }
    listeners.forEach((listener) => listener());
  }

  return [theme, setTheme] as const;
}
