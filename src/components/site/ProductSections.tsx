import type { ReactNode } from "react";
import styles from "./site.module.css";
import { Accent, Asterisk, Avatar, AvatarStack, Eyebrow, Mono, TEAMS_HREF, cx } from "./ui";
import { GetCreosForm } from "@/components/GetCreosForm";

type Product = "outlier" | "signal";

const PRODUCTS: Record<Product, { name: string; blurb: string; emoji: string }> = {
  outlier: { name: "Outlier", blurb: "Content intelligence", emoji: "🔭" },
  signal: { name: "Signal", blurb: "Creative analysis", emoji: "🎯" },
};

// "<Product> comes with Creos." — the product itself, then the other one,
// then the unannounced third, all included in one founding-access price.
export function PricingSection({ product, teamsCopy }: { product: Product; teamsCopy: string }) {
  const other: Product = product === "outlier" ? "signal" : "outlier";
  const rows = [PRODUCTS[product], PRODUCTS[other]];

  return (
    <section id="pricing" className={styles.pricingSec}>
      <div className={styles.wrap}>
        <Eyebrow>Pricing</Eyebrow>
        <h2 className={cx(styles.disp, styles.h2)}>
          {PRODUCTS[product].name} comes <Accent>with Creos.</Accent>
        </h2>
        <div className={styles.priceRow}>
          <div className={styles.includes}>
            {rows.map((r) => (
              <div key={r.name} className={styles.include}>
                <Avatar>{r.emoji}</Avatar>
                <div className={styles.includeText}>
                  <span className={styles.disp}>{r.name}</span>
                  <span>{r.blurb}</span>
                </div>
                <Mono className={styles.includeTag}>Included</Mono>
              </div>
            ))}
            <div className={cx(styles.include, styles.includeLab)}>
              <Avatar>🧪</Avatar>
              <div className={styles.includeText}>
                <span className={styles.disp}>???</span>
                <span>Something new is forming in the lab</span>
              </div>
              <Mono className={styles.includeTag}>Included</Mono>
            </div>
          </div>

          <div className={styles.priceCol}>
            <div className={styles.priceCard}>
              <Mono>Founding access</Mono>
              <div className={styles.priceAmt}>
                <span className={styles.disp}>A$15</span>
                <span>/month</span>
              </div>
              <p className={styles.priceNote}>Your founding price stays yours while you’re subscribed.</p>
              <GetCreosForm />
              <Mono className={styles.priceFine}>No lock-in. Cancel anytime.</Mono>
            </div>
          </div>
        </div>

        <div className={styles.teams}>
          <div className={styles.teamsLeft}>
            <AvatarStack people={["👩🏻", "🧔🏾", "👩🏼‍🦰"]} />
            <span>{teamsCopy}</span>
          </div>
          <a href={TEAMS_HREF} className={styles.teamsLink}>
            Talk to us →
          </a>
        </div>
      </div>
    </section>
  );
}

export function ProductClose({ children, sub }: { children: ReactNode; sub: string }) {
  return (
    <section className={cx(styles.wrap, styles.closeProd)}>
      <div className={styles.closeHub}>
        <Asterisk size={48} />
      </div>
      <h2 className={cx(styles.disp, styles.h2CloseProd)}>{children}</h2>
      <p className={styles.closeSub}>{sub}</p>
      <a href="#pricing" className={cx(styles.btn, styles.btnAccent, styles.btnMobFull)}>
        Get Creos, A$15/month
      </a>
    </section>
  );
}
