"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FEATURE_LABELS = [
  "Dashboard",
  "Campaign Manager",
  "Reporting",
  "Attribution",
  "Calendar",
  "Tasks",
  "CRM",
  "Workflows",
  "Automations",
  "Audience Builder",
  "Asset Manager",
  "Approvals",
  "Forecasting",
  "Integrations",
  "Analytics",
  "Segments",
  "Permissions",
  "Templates",
];

// Scattered, semi-random but deterministic placement — same on every render,
// no layout shift, no need for client-only randomness.
function labelStyle(i: number): React.CSSProperties {
  const seed = i * 47;
  const top = (seed * 13) % 90;
  const left = (seed * 7) % 88;
  const rotate = ((seed % 13) - 6) * 1.4;
  return { top: `${top}%`, left: `${left}%`, transform: `rotate(${rotate}deg)` };
}

// The old version of this section was headline + paragraph + three boxes —
// the most "template SaaS landing page" part of the whole site. This tells
// the same point (marketing software has become bloated) as a visual beat
// instead: a wall of feature labels accumulates, then clears on scroll to
// leave the actual philosophy behind.
export default function BloatStory() {
  const [resolved, setResolved] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setResolved(true);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative border-t border-white/10" style={{ height: "220vh" }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {FEATURE_LABELS.map((label, i) => (
            <span
              key={label}
              className="absolute whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-muted transition-all duration-700 ease-out"
              style={{
                ...labelStyle(i),
                opacity: resolved ? 0 : 0.8,
                filter: resolved ? "blur(6px)" : "none",
                transitionDelay: resolved ? `${i * 20}ms` : "0ms",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <p
            className={cn(
              "text-2xl font-semibold tracking-tight transition-opacity duration-500 sm:text-3xl",
              resolved ? "opacity-0" : "opacity-100"
            )}
          >
            Marketing software has become bloated.
          </p>

          <div
            className={cn(
              "absolute inset-x-0 top-0 transition-all duration-700",
              resolved ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">One clear job per tool.</p>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted">
              Creos Labs takes a different approach — focused tools designed to do one job exceptionally
              well, without dashboards you don&apos;t need, features you&apos;ll never use, or enterprise
              complexity.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-[14.5px] font-medium sm:flex-row sm:gap-8">
              <span>
                Outlier <span className="text-muted">→</span> Find what&apos;s working.
              </span>
              <span>
                Signal <span className="text-muted">→</span> Make better creative.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sits roughly mid-scroll through the section's runway; crossing it
          resolves the clutter into the payoff above. */}
      <div ref={triggerRef} className="absolute top-1/2 h-px w-full" aria-hidden />
    </section>
  );
}
