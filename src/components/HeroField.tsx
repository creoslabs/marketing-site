"use client";

import { useRef, type PointerEventHandler } from "react";

// The recurring Creos visual idea: real signal readouts (a score, a lift, a
// product name) drifting slowly through low-opacity space — Creos finds the
// signal inside marketing noise. Deliberately not decorative particles; each
// label is something the products actually surface.
const SIGNALS: { text: string; top: string; left: string; color: string; duration: number; delay: number }[] = [
  { text: "6.4×", top: "18%", left: "12%", color: "text-accent-blue", duration: 13, delay: 0 },
  { text: "OUTLIER", top: "30%", left: "82%", color: "text-accent-blue", duration: 16, delay: 1.5 },
  { text: "82/100", top: "68%", left: "16%", color: "text-accent-violet", duration: 14.5, delay: 0.6 },
  { text: "SIGNAL", top: "14%", left: "68%", color: "text-accent-violet", duration: 15, delay: 2 },
  { text: "+214%", top: "78%", left: "72%", color: "text-accent-coral", duration: 17, delay: 0.9 },
  { text: "11.2×", top: "50%", left: "6%", color: "text-accent-coral", duration: 13.5, delay: 2.4 },
];

// A very subtle, slow-moving field behind the hero headline — a few soft
// blurred colour orbs drifting independently (CSS keyframes, cheap), the
// drifting signal readouts above, plus a faint spotlight that leans toward
// the cursor. Kept low-opacity and slow on purpose: this should read as
// "alive" without competing with the headline.
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
      <div className="hero-orb-a absolute left-[18%] top-[8%] h-[26rem] w-[26rem] rounded-full bg-accent-blue/20 blur-[110px]" />
      <div className="hero-orb-b absolute right-[14%] top-[22%] h-[22rem] w-[22rem] rounded-full bg-accent-violet/[0.16] blur-[110px]" />
      <div className="hero-orb-c absolute bottom-[6%] left-[38%] h-[20rem] w-[20rem] rounded-full bg-accent-coral/[0.12] blur-[110px]" />

      {SIGNALS.map((s) => (
        <span
          key={s.text}
          className={`signal-float absolute font-mono text-xs font-medium tracking-wide opacity-[0.16] ${s.color}`}
          style={{
            top: s.top,
            left: s.left,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.text}
        </span>
      ))}

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
