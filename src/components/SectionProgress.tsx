"use client";

import { useEffect, useRef } from "react";

export function SectionProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const progress = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div className="sticky top-[52px] z-30 h-px w-full bg-white/5" aria-hidden>
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-accent-blue via-accent-violet to-accent-coral"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
