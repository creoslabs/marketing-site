import { LiquidButton } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

export default function CTA() {
  return (
    <section id="contact" className="relative border-t border-white/10 py-28">
      <Reveal className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Want custom marketing technology built for your business?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Tell us what you&apos;re trying to build — we&apos;ll take it from there.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LiquidButton asChild size="xl" className="w-full rounded-full sm:w-auto">
            <a href="mailto:jackson@creos-labs.com">jackson@creos-labs.com</a>
          </LiquidButton>
        </div>
      </Reveal>
    </section>
  );
}
