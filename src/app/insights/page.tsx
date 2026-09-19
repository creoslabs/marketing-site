import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Insights — Creos Labs",
  description: "Notes on what's working in marketing, from the data behind Outlier and Signal.",
};

export default function InsightsPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-44 pb-28">
          <div className="pointer-events-none absolute -top-64 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />
          <div className="relative mx-auto max-w-2xl px-6 text-center">
            <Reveal>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Insights</h1>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                Notes on what&apos;s actually working in marketing, drawn from the data behind Outlier
                and Signal — coming soon.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
