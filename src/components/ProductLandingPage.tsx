import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ProductShowcase, type ProductData } from "@/components/ProductShowcase";
import { LiquidButton } from "@/components/ui/button";

export type HowItWorksStep = { title: string; body: string };
export type Faq = { q: string; a: string };

export function ProductLandingPage({
  product,
  heroDescription,
  howItWorks,
  useCases,
  faqs,
}: {
  product: ProductData;
  heroDescription: string;
  howItWorks: HowItWorksStep[];
  useCases: string[];
  faqs: Faq[];
}) {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-44 pb-20">
          <div className="pointer-events-none absolute -top-64 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
                Live — early access
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{product.tagline}</h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">{heroDescription}</p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <LiquidButton asChild size="xl" className="w-full rounded-full sm:w-auto">
                  <Link href="/#pricing">Get Creos →</Link>
                </LiquidButton>
                <LiquidButton asChild variant="secondary" size="xl" className="w-full rounded-full sm:w-auto">
                  <a href="#how-it-works">See how it works</a>
                </LiquidButton>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative py-16">
          <div className="mx-auto max-w-[1400px] px-6">
            <Reveal>
              <ProductShowcase product={product} />
            </Reveal>
          </div>
        </section>

        <section id="how-it-works" className="relative border-t border-white/10 py-28">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">How it works</h2>
            </Reveal>
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {howItWorks.map((step, i) => (
                <Reveal key={step.title} delay={i * 100} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <span className="text-xs font-semibold text-accent-blue">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-3 text-[15px] font-semibold">{step.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-28">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Reveal>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">Use cases</h2>
            </Reveal>
            <Reveal delay={100} className="mt-10 flex flex-wrap justify-center gap-3">
              {useCases.map((useCase) => (
                <span
                  key={useCase}
                  className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-[13.5px] text-foreground/90"
                >
                  {useCase}
                </span>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-28">
          <div className="mx-auto max-w-2xl px-6">
            <Reveal className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">FAQ</h2>
            </Reveal>
            <div className="mt-12 flex flex-col gap-6">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 60}>
                  <p className="text-[15px] font-semibold">{faq.q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{faq.a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-28">
          <Reveal className="mx-auto max-w-xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to try {product.name}?
            </h2>
            <p className="mt-4 text-muted">One Creos subscription. Every tool, including {product.name}.</p>
            <div className="mt-8 flex justify-center">
              <LiquidButton asChild size="xl" className="rounded-full">
                <Link href="/#pricing">Get Creos →</Link>
              </LiquidButton>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
