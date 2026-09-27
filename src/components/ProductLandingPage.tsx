import Link from "next/link";
import { headers } from "next/headers";
import { ProductPageHeader } from "@/components/home/ProductPageHeader";
import { ProductPageFooter } from "@/components/home/ProductPageFooter";
import { OutlierDemoPanel } from "@/components/home/OutlierDemoPanel";
import { SignalDemoPanel } from "@/components/home/SignalDemoPanel";
import { HomePricing } from "@/components/home/HomePricing";
import homeStyles from "@/components/home/home.module.css";
import { Reveal } from "@/components/Reveal";
import { type ProductData } from "@/components/ProductShowcase";
import { LiveDot } from "@/components/LiveDot";
import { LandingSignIn } from "@/components/LandingSignIn";
import { serverProductHref } from "@/lib/product-links";
import { getUser } from "@/lib/supabase/data";

export type HowItWorksStep = { title: string; body: string };
export type Faq = { q: string; a: string };

export async function ProductLandingPage({
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
  // This page also serves as the signed-out landing page at the product's
  // own subdomain root (outlier./signal.<host>/) — "/#pricing" only exists
  // on the root marketing homepage.
  const headerList = await headers();
  const pricingHref = serverProductHref(headerList, "root", "/#pricing");
  const productKey = product.name.toLowerCase() as "outlier" | "signal";
  const isLoggedIn = Boolean(await getUser());
  const styles = homeStyles;

  return (
    <div className={styles.creosHome}>
      <ProductPageHeader />
      <main>
        <section className={styles.productHero}>
          <div className={styles.wrap}>
            <Reveal>
              <span className={styles.label}>
                <LiveDot /> Live — early access
              </span>
              <h1 className={styles.display}>
                <span>{product.tagline}</span>
              </h1>
              <p>{heroDescription}</p>
              <div className={styles.prod}>
                <Link className={styles.btn} href={pricingHref}>
                  Get Creos
                </Link>
                <a href="#demo">
                  See how it works <span className={styles.arrow}>↗</span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section>
          <div className={styles.wrap}>
            <Reveal>
              <LandingSignIn productName={product.name} product={productKey} isLoggedIn={isLoggedIn} />
            </Reveal>
          </div>
        </section>

        <section id="demo" className={styles.demo}>
          <div className={`${styles.wrap} ${styles.secHead}`}>
            <span className={styles.label}>
              See it in action <span className={styles.status}>Live, early access</span>
            </span>
          </div>
          <Reveal scale>{productKey === "outlier" ? <OutlierDemoPanel /> : <SignalDemoPanel />}</Reveal>
        </section>

        <section className={styles.sec} id="how-it-works">
          <div className={styles.wrap}>
            <span className={styles.label}>How it works</span>
            <div className={styles.steps}>
              {howItWorks.map((step, i) => (
                <Reveal key={step.title} delay={i * 100}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{step.title}</b>
                  <p>{step.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sec}>
          <div className={styles.wrap}>
            <span className={styles.label}>Use cases</span>
            <Reveal delay={100} className={styles.tags}>
              {useCases.map((useCase) => (
                <span key={useCase}>{useCase}</span>
              ))}
            </Reveal>
          </div>
        </section>

        <section className={styles.sec}>
          <div className={styles.wrap}>
            <span className={styles.label}>FAQ</span>
            <div className={styles.faq}>
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 60} className={styles.faqRow}>
                  <p>{faq.q}</p>
                  <p>{faq.a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HomePricing />
      </main>
      <ProductPageFooter />
    </div>
  );
}
