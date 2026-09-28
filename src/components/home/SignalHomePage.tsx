import Link from "next/link";
import { headers } from "next/headers";
import styles from "./home.module.css";
import { SignalHeader } from "./SignalHeader";
import { SignalDemoPanel } from "./SignalDemoPanel";
import { ProductPageFooter } from "./ProductPageFooter";
import { GetCreosForm } from "@/components/GetCreosForm";
import { Reveal } from "@/components/Reveal";
import { serverProductHref, serverDashboardHref } from "@/lib/product-links";
import { getUser } from "@/lib/supabase/data";

const STEPS = [
  {
    title: "Score",
    body: "Every asset checked tier by tier against format-specific criteria.",
  },
  {
    title: "Benchmark",
    body: "Every score placed against every other asset you've analysed in that format, so a number means something concrete.",
  },
  {
    title: "Review",
    body: "Upload a whole round of creative at once and see every score land side by side.",
  },
];

const ROUND_ROWS = [
  { rank: "01", asset: "Hydration serum — problem/solution", format: "9:16 video", flag: "Two competing CTAs", score: "82" },
  { rank: "02", asset: "Hydration serum — founder story", format: "9:16 video", flag: "Hook lands at 2.4 s", score: "74" },
  { rank: "03", asset: "Hydration serum — UGC review", format: "9:16 video", flag: "No product in first frame", score: "69" },
  { rank: "04", asset: "Before/after carousel", format: "1:1 static", flag: "Benefit needs sound", score: "63" },
  { rank: "05", asset: "Offer banner", format: "1:1 static", flag: "Brand missing in final frame", score: "51" },
];

const FAQS = [
  {
    q: "Which formats can Signal score?",
    a: "Static images and video ads — each format is scored against its own criteria, so a video score and a static score are never averaged together.",
  },
  {
    q: "What does the score compare against?",
    a: "Every other asset you've analysed in that format — so an 82 tells you where this ad sits in your own work, not an abstract average.",
  },
  {
    q: "Can I review a whole campaign at once?",
    a: "Yes. Upload a round of creative together and every score lands side by side.",
  },
];

const HERO_TICKS = [
  10.0, 21.67, 28.33, 33.33, 36.67, 38.33, 41.67, 43.33, 46.67, 48.33, 51.67, 53.33, 55.0, 56.67, 58.33, 60.0, 61.67,
  63.33, 65.0, 68.33, 71.67, 73.33, 83.33, 88.33,
];
const HERO_ME_TICK = 78.33;

const TABLE_GRID = "60px minmax(0,1.6fr) minmax(0,0.8fr) minmax(0,1.4fr) 140px";

export async function SignalHomePage() {
  const headerList = await headers();
  const loginHref = serverProductHref(headerList, "root", "/login");
  const dashboardHref = serverDashboardHref(headerList, "signal");
  const isLoggedIn = Boolean(await getUser());

  return (
    <div className={styles.creosHome}>
      <SignalHeader isLoggedIn={isLoggedIn} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.wrap} ${styles.heroGrid}`}>
            <div>
              <Reveal>
                <span className={styles.label}>
                  Signal / Creative analysis <span className={styles.status}>Live, early access</span>
                </span>
                <h1 className={styles.display}>
                  <span>Know</span>
                  <span>before you</span>
                  <span>spend.</span>
                </h1>
                <p className={styles.lede}>
                  <span>Upload creative before you publish.</span>
                  <span>Every asset checked beat by beat against format-specific criteria.</span>
                  <span>Every score benchmarked against everything you&rsquo;ve made.</span>
                </p>
                <div className={styles.prod}>
                  <a href="#how">
                    HOW IT WORKS <span className={styles.arrow}>↗</span>
                  </a>
                  <a href="#demo">
                    SEE A BREAKDOWN <span className={styles.arrow}>↗</span>
                  </a>
                  <a href="#pricing">
                    PRICING <span className={styles.arrow}>↗</span>
                  </a>
                </div>
              </Reveal>
            </div>

            <aside className={styles.feed} aria-label="Live analysis">
              <div className={`${styles.feedHead} ${styles.label}`}>
                <span className={styles.live} aria-hidden="true" />
                Live analysis
              </div>
              <div className={styles.entry}>
                <span className={styles.label}>01 / Score</span>
                <p className={`${styles.big} ${styles.bigNum}`}>
                  82<span style={{ fontSize: 22, fontWeight: 500, color: "var(--graphite)" }}>/100</span>
                </p>
                <p className={styles.meta}>
                  Hydration serum, 15 s vertical.
                  <br />
                  Top 10% of your 24 other 9:16 assets.
                </p>
                <div className={styles.dist} style={{ marginTop: 18 }}>
                  {HERO_TICKS.map((left, i) => (
                    <i key={i} className={styles.distTick} style={{ left: `${left}%`, height: 14 }} />
                  ))}
                  <i className={`${styles.distTick} ${styles.distMe}`} style={{ left: `${HERO_ME_TICK}%`, height: 34 }} />
                </div>
              </div>
              <div className={styles.entry}>
                <span className={styles.label}>02 / Flagged</span>
                <p className={`${styles.big} ${styles.bigWord}`}>One clear CTA</p>
                <p className={styles.meta}>Two offers compete in the last 3 s.</p>
                <div className={styles.legend}>
                  <span>
                    <span className={`${styles.mk} ${styles.mkPass}`} />6 pass
                  </span>
                  <span>
                    <span className={`${styles.mk} ${styles.mkPartial}`} />2 partial
                  </span>
                  <span>
                    <span className={styles.mk} />1 fail
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.loop} id="how" aria-label="How Signal works">
          <div className={styles.wrap}>
            <div>
              <b>Upload</b>
              <p>One asset or a whole round, before it goes live.</p>
            </div>
            <div>
              <b>Score</b>
              <p>Checked tier by tier against format-specific criteria.</p>
            </div>
            <div>
              <b>Benchmark</b>
              <p>Placed against everything you&rsquo;ve analysed in that format.</p>
            </div>
            <div>
              <b>Fix</b>
              <p>Know which beat to change before you spend a dollar.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.sec} ${styles.demo}`} id="demo">
          <div className={`${styles.wrap} ${styles.secHead}`}>
            <span className={styles.label}>See it in action</span>
            <h2 className={styles.display}>
              <span>Your ads have</span>
              <span>more to say</span>
              <span>than ROAS.</span>
            </h2>
            <div className={styles.intro}>
              <p>
                Upload creative before you publish. Signal checks it beat by beat against what tends to hold
                attention, and benchmarks the score against everything you&rsquo;ve made before.
              </p>
              <a href="#pricing">
                Analyse your first ad <span className={styles.arrow}>↗</span>
              </a>
            </div>
          </div>
          <Reveal scale>
            <SignalDemoPanel />
          </Reveal>
        </section>

        <section className={styles.sec}>
          <div className={styles.wrap}>
            <span className={styles.label}>How it works</span>
            <h2 className={styles.display}>
              <span>Check it</span>
              <span>before the</span>
              <span>market does.</span>
            </h2>
            <div className={styles.steps}>
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 100}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{step.title}</b>
                  <p>{step.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sec} id="round">
          <div className={styles.wrap}>
            <span className={styles.label}>Review a round</span>
            <div className={styles.intro} style={{ marginTop: 0 }}>
              <h2 className={styles.display}>
                <span>Every asset.</span>
                <span>Side by side.</span>
              </h2>
              <p>
                Upload a whole round of creative at once. See which one to run, and which beat is holding the others
                back.
              </p>
            </div>
            <div className={styles.tableHead} style={{ gridTemplateColumns: TABLE_GRID }}>
              <span>#</span>
              <span>Asset</span>
              <span>Format</span>
              <span>Top flag</span>
              <span className={styles.right}>Score</span>
            </div>
            <div className={styles.feedTable} style={{ marginTop: 0, borderTop: "none" }}>
              {ROUND_ROWS.map((row) => (
                <div className={styles.feedRow} style={{ gridTemplateColumns: TABLE_GRID }} key={row.rank}>
                  <span className={styles.feedRank}>{row.rank}</span>
                  <span>{row.asset}</span>
                  <span className={styles.feedMeta}>{row.format}</span>
                  <span className={styles.feedMeta}>{row.flag}</span>
                  <span className={styles.feedScore}>
                    {row.score}
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--graphite)" }}>/100</span>
                  </span>
                </div>
              ))}
            </div>
            <p className={styles.caption}>Sample data.</p>
          </div>
        </section>

        <section className={styles.sec} id="pricing">
          <div className={styles.wrap}>
            <h2 className={styles.display}>
              <span>Signal comes</span>
              <span>with Creos.</span>
            </h2>
            <div className={styles.plan}>
              <ul className={styles.rows}>
                <li>
                  <b>Signal</b>
                  <span>Creative analysis</span>
                  <em>Included</em>
                </li>
                <li>
                  <b>Outlier</b>
                  <span>Content intelligence</span>
                  <em>Included</em>
                </li>
                <li className={styles.rowsLab}>
                  <b>???</b>
                  <span>Something new is forming in the lab</span>
                  <em>Included</em>
                </li>
              </ul>
              <div className={styles.price}>
                <small>Founding access</small>
                <p className={styles.amt}>
                  A$15<span>/month</span>
                </p>
                <p>Your founding price stays yours while you&rsquo;re subscribed.</p>
                <div style={{ marginTop: 24 }}>
                  <GetCreosForm />
                </div>
                <p style={{ fontSize: 13, marginTop: 16 }}>No lock-in. Cancel anytime.</p>
              </div>
            </div>
            <div className={styles.teams}>
              <span>Reviewing creative for multiple brands? We&rsquo;re working with selected teams and agencies.</span>
              <a href="mailto:hello@creos-labs.com?subject=Signal%20for%20teams">Talk to us</a>
            </div>
          </div>
        </section>

        <section className={styles.sec} id="faq">
          <div className={`${styles.wrap} ${styles.faqGrid}`}>
            <div>
              <span className={styles.label}>FAQ</span>
              <h2 className={styles.display}>Questions.</h2>
            </div>
            <div className={styles.faq}>
              {FAQS.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 60} className={styles.faqRow}>
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </Reveal>
              ))}
              <div className={styles.faqRow}>
                {isLoggedIn ? (
                  <>
                    <h3>Already using Signal?</h3>
                    <p>
                      You&rsquo;re signed in. <Link href={dashboardHref}>Go to Dashboard</Link>
                    </p>
                  </>
                ) : (
                  <>
                    <h3>Already using Signal?</h3>
                    <p>
                      Sign in with your Creos Labs account. <Link href={loginHref}>Log in</Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.close}>
          <div className={styles.wrap}>
            <h2 className={styles.display}>
              <span>Check it.</span>
              <span>Then ship it.</span>
            </h2>
            <div className={styles.row}>
              <p>Outlier, Signal, and everything we&rsquo;re experimenting with next.</p>
              <a className={styles.btn} href="#pricing">
                Get Creos, A$15/month
              </a>
            </div>
          </div>
        </section>
      </main>
      <ProductPageFooter />
    </div>
  );
}
