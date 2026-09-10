import { LiquidButton } from "@/components/ui/button";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-44 pb-32">
      <div className="pointer-events-none absolute -top-64 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div
          className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
          Founded by a working marketer
        </div>

        <h1
          className="animate-fade-up text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-[5.5rem]"
          style={{ animationDelay: "100ms" }}
        >
          Marketing technology,
          <br />
          built by marketers.
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
          style={{ animationDelay: "200ms" }}
        >
          Creos Labs builds the tools we wish existed in our own day-to-day
          marketing work — sitting at the bridge between creativity and
          business.
        </p>

        <div
          className="animate-fade-up mt-10 flex justify-center"
          style={{ animationDelay: "300ms" }}
        >
          <LiquidButton asChild size="xl" className="w-full rounded-full sm:w-auto">
            <a href="#waitlist">Get early access</a>
          </LiquidButton>
        </div>
      </div>
    </section>
  );
}
