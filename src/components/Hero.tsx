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
          Creos Labs is a technology company
        </div>

        <h1
          className="animate-fade-up text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-[5.5rem]"
          style={{ animationDelay: "100ms" }}
        >
          We build the technology
          <br />
          behind Cardindex and Creos.
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
          style={{ animationDelay: "200ms" }}
        >
          We design, engineer, and run our own products end to end.
          No clients, no contracts — just a small team building technology
          it owns.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row"
          style={{ animationDelay: "300ms" }}
        >
          <LiquidButton asChild size="xl" className="w-full rounded-full sm:w-auto">
            <a href="#products">Explore our products</a>
          </LiquidButton>
          <a
            href="#contact"
            className="group inline-flex items-center gap-1 text-[17px] font-medium text-accent-blue transition hover:opacity-80"
          >
            Get in touch
            <span className="transition group-hover:translate-x-0.5">›</span>
          </a>
        </div>
      </div>
    </section>
  );
}
