import { Reveal } from "@/components/Reveal";

const USE_CASES = [
  "Track creators in your niche.",
  "Research competitors.",
  "Analyse your own content.",
  "Review creative before launch.",
  "Find patterns across a category.",
];

export default function WhoItsFor() {
  return (
    <section className="relative border-t border-white/10 py-28">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            Built for real workflows
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            However you build your brand.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-14 flex flex-wrap justify-center gap-3">
          {USE_CASES.map((useCase) => (
            <span
              key={useCase}
              className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-[13.5px] text-foreground/90 transition-colors duration-300 hover:border-white/30"
            >
              {useCase}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
