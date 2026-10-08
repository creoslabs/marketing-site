import { existsSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import styles from "./site.module.css";
import { Accent, Eyebrow, Mono, cx } from "./ui";

const LOGOS = [
  { key: "slack", name: "Slack" },
  { key: "email", name: "Email" },
  { key: "sheets", name: "Google Sheets" },
  { key: "notion", name: "Notion" },
] as const;

function Envelope() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

// "Works with" row: official logo files from public/brand/integrations/
// (full colour, equal size, never redrawn) where they've been added, the
// name alone until then. Never phrased as a partnership.
function LogoRow({ small }: { small?: boolean }) {
  return (
    <div className={cx(styles.integLogos, small && styles.integLogosSmall)} aria-label="Works with Slack, email, Google Sheets and Notion">
      {LOGOS.map((l) => {
        const hasFile = l.key !== "email" && existsSync(path.join(process.cwd(), "public/brand/integrations", `${l.key}.svg`));
        return (
          <span key={l.key} className={styles.integLogo}>
            {(l.key === "email" || hasFile) && (
              <span className={styles.integLogoTile} aria-hidden="true">
                {l.key === "email" ? <Envelope /> : // eslint-disable-next-line @next/next/no-img-element -- static brand SVG
                  <img src={`/brand/integrations/${l.key}.svg`} alt="" />}
              </span>
            )}
            {l.name}
          </span>
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
