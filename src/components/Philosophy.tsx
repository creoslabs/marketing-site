import { Reveal } from "@/components/Reveal";

const STEPS = ["Research what's working.", "Understand what you're making.", "Make better decisions."];

const PILLARS = [
  { name: "Focused", body: "One clear job per tool." },
  { name: "Practical", body: "Built around real marketing workflows." },
  { name: "Accessible", body: "Useful whether you're one person or an entire team." },
];

export default function Philosophy() {
  return (
    <section className="relative border-t border-white/10 py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            Built for people building brands
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Whether you&apos;re growing your own audience, running a business,
            or working inside a marketing team.
          </p>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted">
            Creos Labs builds focused tools for the parts of marketing that
            shouldn&apos;t be difficult.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center"
            >
              <span className="text-xs font-semibold text-accent-blue">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 text-[15px] font-medium leading-snug">{step}</p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={150} className="mx-auto mt-28 max-w-2xl text-center">
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Marketing software has become bloated.
          </p>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted">
            Creos Labs takes a different approach — focused tools designed to
            do one job exceptionally well, without dashboards you don&apos;t
            need, features you&apos;ll never use, or enterprise complexity.
          </p>
        </Reveal>

        <Reveal delay={200} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-[15px] font-semibold">{p.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
