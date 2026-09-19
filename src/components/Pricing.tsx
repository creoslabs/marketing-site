import { Reveal } from "@/components/Reveal";
import { GetCreosForm } from "@/components/GetCreosForm";

const INCLUDED = [
  "Access to Outlier + Signal.",
  "New Creos tools added during early access.",
  "Founding price stays yours while subscribed.",
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative border-t border-white/10 py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">Pricing</h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">One subscription. Every tool.</p>
        </Reveal>

        <Reveal
          delay={100}
          className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-[box-shadow,border-color] duration-500 hover:border-white/20 hover:shadow-[0_0_90px_-25px_rgba(41,151,255,0.4)] sm:p-10"
        >
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted">
              Founding Access
            </span>
            <p className="mt-6 text-5xl font-semibold tracking-tight">
              A$15<span className="text-xl font-medium text-muted">/month</span>
            </p>

            <ul className="mt-8 flex flex-col gap-3 text-left">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14.5px] text-foreground/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 w-full">
              <GetCreosForm />
            </div>
            <p className="mt-4 text-xs text-muted">No lock-in. Cancel anytime.</p>
          </div>
        </Reveal>

        <Reveal
          delay={150}
          className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center transition-colors duration-300 hover:border-white/20 sm:flex-row sm:justify-between sm:text-left"
        >
          <div>
            <p className="text-[14.5px] font-medium">Using Creos for multiple brands?</p>
            <p className="mt-1 text-[13.5px] text-muted">
              We&apos;re working with selected teams and agencies that need higher usage limits, multiple
              brands, and shared access.
            </p>
          </div>
          <a
            href="mailto:hello@creos-labs.com?subject=Creos%20for%20teams%20%26%20agencies"
            className="shrink-0 text-[13.5px] font-semibold text-accent-blue transition hover:text-accent-blue/80"
          >
            Talk to us <span className="cta-arrow">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
