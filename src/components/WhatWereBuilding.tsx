import { Reveal } from "@/components/Reveal";

const HIGHLIGHTS = [
  {
    label: "Hooks",
    description: "What makes the first three seconds work.",
    dotClassName: "bg-accent-blue",
  },
  {
    label: "Pacing",
    description: "How the best content moves, cut to cut.",
    dotClassName: "bg-accent-violet",
  },
  {
    label: "Structure",
    description: "The shape underneath content that performs.",
    dotClassName: "bg-accent-coral",
  },
];

export default function WhatWereBuilding() {
  return (
    <section id="building" className="relative py-28">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            What we&apos;re building
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Content Lab
          </p>

          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
              In development — coming soon
            </span>
          </div>

          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted">
            Content Lab analyzes competitor and creator content — including
            video — for what&apos;s actually working: hooks, pacing, and
            structure. Not just surface-level engagement stats, but the
            craft underneath the numbers.
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-16 grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-surface p-6"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${item.dotClassName}`}
              />
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {item.label}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
