import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { LiquidButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — Creos Labs",
  description: "Creos Labs builds focused marketing tools for people building brands.",
};

const PRINCIPLES = [
  {
    name: "One job per tool",
    body: "Outlier tracks and scores. Signal reviews creative. Neither tries to be a full marketing suite, because neither should be.",
  },
  {
    name: "Built around real workflows",
    body: "Every feature starts from a specific task someone actually does — not a feature checklist or a competitor's changelog.",
  },
  {
    name: "Priced like a tool, not a platform",
    body: "One subscription, no per-seat math, no enterprise sales call. Useful whether you're one person or a team.",
  },
];

const STATUS = [
  { name: "Outlier", state: "Live", body: "Tracking creators and scoring posts for early-access users." },
  { name: "Signal", state: "Live", body: "Scoring static and video creative against best-practice criteria." },
  { name: "What's next", state: "In the lab", body: "More focused tools, added to the same subscription as they ship." },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-44 pb-24">
          <div className="pointer-events-none absolute -top-64 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />
          <div className="relative mx-auto max-w-2xl px-6 text-center">
            <Reveal>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Built from doing the work.</h1>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                Creos Labs started with a simple idea: marketing software should make the work easier,
                not create more work. We&apos;re building focused tools around the problems marketers,
                creators, and people building brands actually encounter.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <Reveal>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">Why Creos Labs</h2>
              <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Most marketing software adds a step. We wanted to remove one.
              </p>
            </Reveal>
            <Reveal delay={100} className="mt-8 flex flex-col gap-4 text-left leading-relaxed text-muted">
              <p>
                Every tool we tried answered a narrower question than the one we actually had. Was this
                creator&apos;s post good, or just big? Was this ad going to work, or just look fine in a
                deck? The data was usually right there — buried in a dashboard, or not connected to
                anything at all.
              </p>
              <p>
                Nobody had turned it into an answer. So we started building the tools we wanted to use
                ourselves: something that scores a post against a creator&apos;s own history instead of a
                vanity chart, something that checks a piece of creative against what actually tends to
                work instead of a gut feeling.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">How we build</h2>
            </Reveal>
            <Reveal delay={100} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <div key={p.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-[15px] font-semibold">{p.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-24">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">Where we are now</h2>
              <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Two tools shipped. Not the last two.
              </p>
            </Reveal>

            <Reveal delay={100} className="mt-12 flex flex-col gap-3">
              {STATUS.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
                    <span className="text-[14.5px] font-semibold">{item.name}</span>
                    <span className="text-xs font-medium text-accent-blue">{item.state}</span>
                  </div>
                  <p className="text-[13.5px] text-muted sm:max-w-sm sm:text-right">{item.body}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-24">
          <Reveal className="mx-auto max-w-xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Come build with us.</h2>
            <p className="mt-4 text-muted">
              Get Outlier, Signal, and whatever we build next — one subscription, no lock-in.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LiquidButton asChild size="xl" className="w-full rounded-full sm:w-auto">
                <Link href="/#pricing">Get Creos →</Link>
              </LiquidButton>
              <a
                href="mailto:hello@creos-labs.com"
                className="text-[13.5px] font-medium text-muted transition hover:text-foreground"
              >
                Or just say hello →
              </a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
