import { LiquidButton } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { HeroField } from "@/components/HeroField";

// The actual signup form lives once, in the pricing card — this is the
// brand payoff, not a second near-identical form. Reuses the hero's signal
// field so the page opens and closes on the same visual idea.
export default function Waitlist() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 py-36">
      <HeroField />
      <Reveal className="relative mx-auto max-w-xl px-6 text-center">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Build the brand.
          <br />
          We&apos;ll build the tools.
        </h2>
        <p className="mt-5 text-muted">Outlier, Signal, and everything we&apos;re experimenting with next.</p>

        <div className="mt-9 flex justify-center">
          <LiquidButton asChild size="xl" className="rounded-full">
            <a href="#pricing">
              Get Creos — A$15/month <span className="cta-arrow">→</span>
            </a>
          </LiquidButton>
        </div>
      </Reveal>
    </section>
  );
}
