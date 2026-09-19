import { Reveal } from "@/components/Reveal";

const TOOLS = [
  { name: "Outlier", status: "Live" },
  { name: "Signal", status: "Live" },
];

export default function TheLab() {
  return (
    <section className="relative border-t border-white/10 py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">The lab</h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">We&apos;re just getting started.</p>
        </Reveal>

        <Reveal delay={100} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {TOOLS.map((tool) => (
            <span
              key={tool.name}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-[14px] font-medium"
            >
              {tool.name}
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-accent-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
                {tool.status}
              </span>
            </span>
          ))}
        </Reveal>

        <Reveal delay={150} className="mt-6 text-sm text-muted">
          More experiments coming.
        </Reveal>
      </div>
    </section>
  );
}
