"use client";

import { useEffect, useState } from "react";

// Counts up from 0 to the real score on mount — a cheap, one-time reveal
// that makes landing on a report feel more alive than a static number.
export function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

// True one frame after mount — used to animate a bar's width in from 0
// without a flash of the unanimated final state on first paint.
export function useRevealed() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return revealed;
}
