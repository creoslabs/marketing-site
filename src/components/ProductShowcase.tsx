"use client";

import { useEffect, useState, type PointerEventHandler } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const CYCLE_MS = 6000;

export type ProductHighlight = {
  label: string;
  description: string;
  dotClassName: string;
  activeClassName: string;
  screenshot: string;
  screenshotAlt: string;
  screenshotWidth: number;
  screenshotHeight: number;
};

export type ProductData = {
  name: string;
  tagline: string;
  description: string;
  imageSide: "left" | "right";
  highlights: ProductHighlight[];
};

export function ProductShowcase({ product }: { product: ProductData }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = product.highlights.length;
  const current = product.highlights[active];

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const id = setTimeout(() => {
      setActive((a) => (a + 1) % count);
    }, CYCLE_MS);

    return () => clearTimeout(id);
  }, [active, paused, count]);

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--x",
      `${((e.clientX - rect.left) / rect.width) * 100}%`
    );
    e.currentTarget.style.setProperty(
      "--y",
      `${((e.clientY - rect.top) / rect.height) * 100}%`
    );
  };

  return (
    <div
      className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={product.imageSide === "right" ? "lg:order-2" : "lg:order-1"}>
        <div className="relative">
          <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-accent-blue/10 blur-3xl" />
          <div
            onPointerMove={handlePointerMove}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-1.5 border-b border-black/10 bg-[#f5f5f7] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div key={current.screenshot} className="animate-fade-in">
              <Image
                src={current.screenshot}
                alt={current.screenshotAlt}
                width={current.screenshotWidth}
                height={current.screenshotHeight}
                className="h-auto w-full"
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(220px circle at var(--x, 50%) var(--y, 50%), rgba(41,151,255,0.14), transparent 70%)",
              }}
            />
          </div>
        </div>
      </div>

      <div className={product.imageSide === "right" ? "lg:order-1" : "lg:order-2"}>
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {product.name}
        </p>

        <div className="mt-3 flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
            In development — coming soon
          </span>
        </div>

        <p className="mt-4 text-sm font-medium text-accent-blue">
          {product.tagline}
        </p>

        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          {product.description}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {product.highlights.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={cn(
                "rounded-2xl border p-5 text-left transition",
                i === active
                  ? `bg-white/[0.06] ${item.activeClassName}`
                  : "border-white/10 bg-surface hover:border-white/20"
              )}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${item.dotClassName}`}
              />
              <span className="mt-3 block text-lg font-semibold tracking-tight">
                {item.label}
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-muted">
                {item.description}
              </span>

              {i === active && (
                <span className="relative mt-4 block h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <span
                    key={active}
                    className={cn("progress-fill absolute inset-y-0 left-0 rounded-full", item.dotClassName)}
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                  />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
