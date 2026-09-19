"use client";

import { useEffect, useRef, useState, type PointerEventHandler } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type ProductHighlight = {
  label: string;
  description: string;
  dotClassName: string;
  glowClassName: string;
  screenshotAlt: string;
  zoomOffsetY: number;
  zoomHeight: number;
};

export type ProductData = {
  name: string;
  tagline: string;
  description: string;
  imageSide: "left" | "right";
  filmstripSrc: string;
  filmstripWidth: number;
  filmstripHeight: number;
  highlights: ProductHighlight[];
};

export function ProductShowcase({ product }: { product: ProductData }) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const count = product.highlights.length;
  const current = product.highlights[active];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setFrameSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    e.currentTarget.style.setProperty("--x", `${px * 100}%`);
    e.currentTarget.style.setProperty("--y", `${py * 100}%`);
    e.currentTarget.style.setProperty("--rx", `${(0.5 - py) * 6}deg`);
    e.currentTarget.style.setProperty("--ry", `${(px - 0.5) * 6}deg`);
    e.currentTarget.style.setProperty("--sx", `${(px - 0.5) * -32}px`);
    e.currentTarget.style.setProperty("--sy", `${(0.5 - py) * -32}px`);
  };

  const handlePointerLeave: PointerEventHandler<HTMLDivElement> = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
    e.currentTarget.style.setProperty("--sx", "0px");
    e.currentTarget.style.setProperty("--sy", "0px");
  };

  const jumpTo = (i: number) => {
    setActive(i);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stepRefs.current[i]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  // Fit by WIDTH, not height — these are wide desktop screenshots, and
  // fitting by a fixed frame height (then centering horizontally) cropped
  // most of the side columns off. Fitting by width shows the full desktop
  // layout every time; the frame's height instead follows each highlight's
  // own zoomHeight so nothing gets cropped vertically either.
  const scale = frameSize.width > 0 ? frameSize.width / product.filmstripWidth : 1;
  const translateY = -current.zoomOffsetY;

  return (
    <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
      <div className={product.imageSide === "right" ? "lg:order-2" : "lg:order-1"}>
        <div className="lg:sticky lg:top-28">
          <div className="relative" style={{ perspective: "1200px" }}>
            <div
              className={cn(
                "pointer-events-none absolute -inset-6 rounded-[2rem] blur-3xl transition-colors duration-500",
                current.glowClassName
              )}
            />
            <div
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white will-change-transform"
              style={{
                transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
                boxShadow:
                  "var(--sx, 0px) var(--sy, 0px) 60px -15px rgba(0,0,0,0.65), 0 25px 50px -20px rgba(0,0,0,0.5)",
                transition: "transform 0.35s ease-out, box-shadow 0.35s ease-out",
              }}
            >
              <div className="flex items-center gap-1.5 border-b border-black/10 bg-[#f5f5f7] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>

              <div
                ref={frameRef}
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: `${product.filmstripWidth} / ${current.zoomHeight}`,
                  transition: "aspect-ratio 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div
                  className="absolute top-0 left-0"
                  style={{
                    transform: `scale(${scale}) translate(0px, ${translateY}px)`,
                    transformOrigin: "0 0",
                    transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <Image
                    src={product.filmstripSrc}
                    alt={current.screenshotAlt}
                    width={product.filmstripWidth}
                    height={product.filmstripHeight}
                    className="max-w-none"
                    priority
                  />
                </div>
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
      </div>

      <div className={product.imageSide === "right" ? "lg:order-1" : "lg:order-2"}>
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {product.name}
        </p>

        <div className="mt-3 flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
            Live — early access
          </span>
        </div>

        <p className="mt-4 text-sm font-medium text-accent-blue">
          {product.tagline}
        </p>

        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          {product.description}
        </p>

        <div className="relative mt-6 lg:mt-10">
          <div className="absolute top-0 bottom-0 left-5 w-px bg-white/10" />
          <div
            className={cn(
              "absolute top-0 left-5 w-px transition-[height] duration-500 ease-out",
              current.dotClassName
            )}
            style={{
              height: count > 1 ? `${(active / (count - 1)) * 100}%` : "0%",
            }}
          />

          {product.highlights.map((item, i) => (
            <div
              key={item.label}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              data-index={i}
              className="flex lg:min-h-[60vh] lg:items-center"
            >
              <button
                type="button"
                onClick={() => jumpTo(i)}
                aria-pressed={i === active}
                className="group/step flex w-full items-start gap-5 py-6 text-left lg:py-0"
              >
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 group-active/step:scale-90",
                    i === active
                      ? cn(item.dotClassName, "border-transparent text-black scale-110")
                      : "border-white/15 bg-background text-muted group-hover/step:scale-105 group-hover/step:border-white/30"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="pt-1.5">
                  <span
                    className={cn(
                      "block text-xl font-semibold tracking-tight transition-colors duration-300 sm:text-2xl",
                      i === active ? "text-foreground" : "text-muted"
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "mt-2 block max-w-sm leading-relaxed text-muted transition-opacity duration-300",
                      i === active ? "opacity-100" : "opacity-50"
                    )}
                  >
                    {item.description}
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
