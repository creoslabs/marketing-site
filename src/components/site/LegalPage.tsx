import type { ReactNode } from "react";
import styles from "./site.module.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Eyebrow, cx } from "./ui";

export const LEGAL_UPDATED = "9 October 2026";
export const CONTACT_EMAIL = "hello@creos-labs.com";

// Shared shell for the privacy, terms and cookie pages: site header and
// footer, a title block, a contents list that sticks beside the text on
// wide screens, then the sections.
export function LegalPage({
  eyebrow,
  title,
  intro,
  toc,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  toc: Array<{ id: string; label: string }>;
  children: ReactNode;
}) {
  return (
    <div className={styles.site}>
      <SiteHeader fromRoot />
      <main>
        <div className={cx(styles.wrap, styles.legalHead)}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className={cx(styles.disp, styles.legalTitle)}>{title}</h1>
          <p className={styles.legalMeta}>Last updated {LEGAL_UPDATED}</p>
          <p className={styles.legalIntro}>{intro}</p>
        </div>
        <div className={cx(styles.wrap, styles.legalBody)}>
          <nav className={styles.legalToc} aria-label="On this page">
            {toc.map((t) => (
              <a key={t.id} href={`#${t.id}`}>
                {t.label}
              </a>
            ))}
          </nav>
          <article className={styles.legalText}>{children}</article>
        </div>
      </main>
      <SiteFooter variant="product" />
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={styles.legalSection}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
