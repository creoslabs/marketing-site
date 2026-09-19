import { LiquidButton } from "@/components/ui/button";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-56 pb-32">
      <div className="pointer-events-none absolute -top-64 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h1
          className="animate-fade-up text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-[5.5rem]"
        >
          <span className="block sm:whitespace-nowrap">Marketing technology,</span>
          <span className="block">built by marketers.</span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
          style={{ animationDelay: "100ms" }}
        >
          Practical tools for people building brands. Research what&apos;s
          working, analyse what you&apos;ve made, and make better marketing
          decisions — without adding more complexity to your workflow.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "200ms" }}
        >
          <LiquidButton asChild size="xl" className="w-full rounded-full sm:w-auto">
            <a href="#products">Explore the tools →</a>
          </LiquidButton>
          <LiquidButton asChild variant="secondary" size="xl" className="w-full rounded-full sm:w-auto">
            <a href="#pricing">Get Creos →</a>
          </LiquidButton>
        </div>
      </div>
    </section>
  );
}
