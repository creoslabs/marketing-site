import { existsSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import styles from "./site.module.css";
import { Reveal } from "@/components/Reveal";
import { Accent, Eyebrow, Mono, cx } from "./ui";

const LOGOS = [
  { key: "slack", name: "Slack" },
  { key: "email", name: "Gmail" },
  { key: "sheets", name: "Google Sheets" },
  { key: "notion", name: "Notion" },
] as const;

// "Works with" row: logos only, no labels. Official logo files from
// public/brand/integrations/ (full colour, equal size, never redrawn) where
// they exist; the name alone as a fallback until a file is added. Never
// phrased as a partnership. Each logo keeps an accessible name.
function LogoRow({ small }: { small?: boolean }) {
  return (
    <div className={cx(styles.integLogos, small && styles.integLogosSmall)} role="list" aria-label="Works with Slack, Gmail, Google Sheets and Notion">
      {LOGOS.map((l, i) => {
        const hasFile = existsSync(path.join(process.cwd(), "public/brand/integrations", `${l.key}.svg`));
        return (
          <Reveal key={l.key} delay={i * 90}>
            {hasFile ? (
              <span role="listitem" className={styles.integLogoTile} data-name={l.name}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG */}
                <img src={`/brand/integrations/${l.key}.svg`} alt={l.name} />
              </span>
            ) : (
              <span role="listitem" className={styles.integLogoName}>
                {l.name}
              </span>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

// A sample of what lands in Slack — the result, not just a logo.
function SlackMock() {
  return (
    <div className={styles.slackMock} aria-label="Example Slack message">
      <Mono className={styles.slackMockTag}>
        <b>Outlier</b> · Outlier detected · Sample
      </Mono>
      <div className={styles.slackMockBody}>
        <div className={styles.slackMockText}>
          <span className={cx(styles.disp, styles.slackMockHead)}>6.2× their median</span>
          <span>@creator_one · 412,000 views vs 66,000 median</span>
          <span>Hook: “Nobody tells you this about…”</span>
          <span className={styles.slackMockBtn}>Open in Outlier</span>
        </div>
        <div className={cx(styles.slackMockThumb, styles.emo)} aria-hidden="true">
          🎬
        </div>
      </div>
    </div>
  );
}

// Homepage band: after the Outlier and Signal sections, before the custom
// build section.
export function IntegrationsBand() {
  return (
    <section id="integrations" className={styles.integBand}>
      <div className={styles.wrap}>
        <div className={styles.integInner}>
          <div className={styles.integText}>
            <Eyebrow>Integrations</Eyebrow>
            <h2 className={cx(styles.disp, styles.h2Integ)}>
              Works where your <Accent>team already does.</Accent>
            </h2>
            <p className={styles.integSub}>Send Outlier alerts and Signal scores straight to Slack, your inbox, Google Sheets or Notion. No social logins required.</p>
            <Mono className={styles.integFine}>Connect once with your Creos Labs account. It works across every Creos Labs product.</Mono>
          </div>
          <div className={styles.integSide}>
            <LogoRow />
            <SlackMock />
          </div>
        </div>
      </div>
    </section>
  );
}

// One line plus a smaller logo row on each product page.
export function IntegrationsLine({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.integLine}>
        <p>{children}</p>
        <LogoRow small />
      </div>
    </div>
  );
}

// Under the hero CTAs: a quiet "Works with" row.
export function HeroIntegrations() {
  return (
    <div className={styles.heroWorks}>
      <Mono className={styles.heroWorksLabel}>Works with</Mono>
      <LogoRow small />
    </div>
  );
}
