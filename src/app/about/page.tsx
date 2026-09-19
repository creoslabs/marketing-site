import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About — Creos Labs",
  description: "Creos Labs builds focused marketing tools for people building brands.",
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-44 pb-28">
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

            <Reveal delay={100} className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              {[
                { name: "Focused", body: "One clear job per tool." },
                { name: "Practical", body: "Built around real marketing workflows." },
                { name: "Accessible", body: "Useful whether you're one person or an entire team." },
              ].map((p) => (
                <div key={p.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-[15px] font-semibold">{p.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
