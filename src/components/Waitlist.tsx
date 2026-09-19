import { LiquidButton } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

// The actual signup form lives once, in the pricing card — this is a
// closing nudge back to it, not a second near-identical form.
export default function Waitlist() {
  return (
    <section className="relative border-t border-white/10 py-28">
      <Reveal className="mx-auto max-w-xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Better tools for building brands.
        </h2>
        <p className="mt-4 text-muted">
          A$15/month for Outlier + Signal, with new Creos tools added
          throughout early access.
        </p>

        <div className="mt-8 flex justify-center">
          <LiquidButton asChild size="xl" className="rounded-full">
            <a href="#pricing">Get Creos — A$15/month</a>
          </LiquidButton>
        </div>
      </Reveal>
    </section>
  );
}
