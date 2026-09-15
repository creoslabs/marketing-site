"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function readStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem("ws-theme");
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.querySelector(".ws")?.setAttribute("data-theme", theme);
}

// Applies the saved theme preference to the nearest .ws root on mount. This
// is needed in addition to each layout's blocking inline script: that script
// only executes on a hard page load (browsers don't run <script> tags that
// arrive via DOM patching), so it's inert on a client-side Link navigation
// between /workspace and /outlier — without this hook, switching between
// the two areas would silently drop back to the dark default.
export function useWsTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const initial = readStoredTheme() ?? "dark";
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  function setTheme(next: Theme) {
    applyTheme(next);
    try {
      localStorage.setItem("ws-theme", next);
    } catch {
      // ignore — private browsing etc.
    }
    setThemeState(next);
  }

  return [theme, setTheme] as const;
}
