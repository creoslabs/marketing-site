"use client";

import { useRef, type PointerEventHandler } from "react";

// A very subtle, slow-moving field behind the hero headline — a few soft
// blurred colour orbs drifting independently (CSS keyframes, cheap), plus a
// faint spotlight that leans toward the cursor. Kept low-opacity and slow on
// purpose: this should read as "alive" without competing with the headline.
export function HeroField() {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current?.style.setProperty("--hx", `${px}%`);
    ref.current?.style.setProperty("--hy", `${py}%`);
  };

  return (
    <div onPointerMove={handlePointerMove} aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="hero-orb-a absolute left-[18%] top-[8%] h-[26rem] w-[26rem] rounded-full bg-accent-blue/20 blur-[110px]"
      />
      <div
        className="hero-orb-b absolute right-[14%] top-[22%] h-[22rem] w-[22rem] rounded-full bg-accent-violet/[0.16] blur-[110px]"
      />
      <div
        className="hero-orb-c absolute bottom-[6%] left-[38%] h-[20rem] w-[20rem] rounded-full bg-accent-coral/[0.12] blur-[110px]"
      />
      <div
        ref={ref}
        className="absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
        style={{
          background: "radial-gradient(420px circle at var(--hx, 50%) var(--hy, 30%), rgba(41,151,255,0.10), transparent 70%)",
        }}
      />
    </div>
  );
}
