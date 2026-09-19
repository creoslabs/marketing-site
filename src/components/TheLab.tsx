import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { LiveDot } from "@/components/LiveDot";

const TOOLS = [
  {
    name: "Outlier",
    tagline: "Find what's outperforming.",
    href: "/products/outlier",
    glow: "hover:shadow-[0_0_60px_-20px_rgba(41,151,255,0.45)]",
  },
  {
    name: "Signal",
    tagline: "Analyse before you publish.",
    href: "/products/signal",
    glow: "hover:shadow-[0_0_60px_-20px_rgba(139,92,246,0.45)]",
  },
];

export default function TheLab() {
  return (
    <section className="relative border-t border-white/10 py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">The lab</h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">We&apos;re just getting started.</p>
        </Reveal>

        <Reveal delay={100} className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <Link
              key={tool.name}
              href={tool.href}
              className={`group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-300 hover:border-white/25 ${tool.glow}`}
              style={{ minHeight: 220 }}
            >
              <span className="text-xs font-semibold text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-xl font-semibold tracking-tight">{tool.name}</p>
                <p className="mt-2 text-[13.5px] text-muted">{tool.tagline}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-accent-blue">
                <LiveDot />
                LIVE
              </span>
            </Link>
          ))}

          <div
            className="lab-card-locked group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7"
            style={{ minHeight: 220 }}
          >
            <span className="text-xs font-semibold text-muted">03</span>
            <div className="lab-glitch-text">
              <p className="text-xl font-semibold tracking-tight text-foreground/60">██████ ████</p>
              <p className="mt-2 text-[13.5px] text-muted">Something new is forming.</p>
            </div>
            <span className="text-xs font-medium text-muted">● IN THE LAB</span>
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-6 text-center text-sm text-muted">
          More experiments coming.
        </Reveal>
      </div>
    </section>
  );
}
