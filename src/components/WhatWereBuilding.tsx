import { Reveal } from "@/components/Reveal";
import { ProductShowcase } from "@/components/ProductShowcase";
import { SectionProgress } from "@/components/SectionProgress";
import { OUTLIER_PRODUCT, SIGNAL_PRODUCT } from "@/lib/product-data";

const PRODUCTS = [OUTLIER_PRODUCT, SIGNAL_PRODUCT];

export default function WhatWereBuilding() {
  return (
    <section id="products" className="relative py-28">
      <SectionProgress targetId="products" />
      <div className="mx-auto max-w-[1400px] px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            Products
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tools built for actual marketing work.
          </p>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted">
            Not just surface-level stats, but the craft and structure
            underneath what actually performs — scoring real creator posts
            and real ad creative for the marketers using them today.
          </p>
        </Reveal>

        <div className="mt-20 flex flex-col gap-28">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.name} delay={i * 100} scale>
              <ProductShowcase product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
