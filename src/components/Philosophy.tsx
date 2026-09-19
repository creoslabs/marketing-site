import { Reveal } from "@/components/Reveal";

const MARQUEE_TEXT = "RESEARCH  →  ANALYSE  →  DECIDE  →  BUILD  —  ";

export default function Philosophy() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 py-28">
      {/* A deliberate break from the page's otherwise uniform content width —
          huge, low-opacity, slow-moving type behind the heading, purely
          decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[6%] select-none whitespace-nowrap text-[6rem] font-bold uppercase leading-none tracking-tight text-white/[0.05] sm:text-[9rem]"
      >
        <div className="marquee-track inline-flex">
          <span className="pr-8">{MARQUEE_TEXT.repeat(3)}</span>
          <span className="pr-8">{MARQUEE_TEXT.repeat(3)}</span>
        </div>
      </div>

      <div className="relative mx-auto max-w-2xl px-6">
        <Reveal className="text-center">
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
      </div>
    </section>
  );
}
