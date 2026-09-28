import Link from "next/link";
import { headers } from "next/headers";
import styles from "./home.module.css";
import { OutlierHeader } from "./OutlierHeader";
import { OutlierDemoPanel } from "./OutlierDemoPanel";
import { ProductPageFooter } from "./ProductPageFooter";
import { GetCreosForm } from "@/components/GetCreosForm";
import { Reveal } from "@/components/Reveal";
import { serverProductHref, serverDashboardHref } from "@/lib/product-links";
import { getUser } from "@/lib/supabase/data";

const STEPS = [
  {
    title: "Add creators",
    body: "Track a creator across TikTok, Instagram, and YouTube — one card per person, however many platforms they're on.",
  },
  {
    title: "Pull posts",
    body: "Outlier scores every post against that creator's own running median, not a universal benchmark.",
  },
  {
    title: "Go deeper",
    body: "Auto-transcribe any post and see its hook, structure, and beats — why it worked, not just that it did.",
  },
];

const FEED_ROWS = [
  { rank: "01", title: "Launch mistakes nobody mentions", creator: "[Creator A]", platform: "Instagram", hook: "Pattern interrupt", score: "41×" },
  { rank: "02", title: "I tested 5 hooks on one product", creator: "[Creator B]", platform: "TikTok", hook: "Challenge", score: "11.2×" },
  { rank: "03", title: "Why this ad actually converted", creator: "[Creator C]", platform: "YouTube", hook: "Contrarian", score: "6.4×" },
  { rank: "04", title: "The 3-second rule for reels", creator: "[Creator A]", platform: "TikTok", hook: "Listicle", score: "3.1×" },
  { rank: "05", title: "Behind the rebrand", creator: "[Creator D]", platform: "Instagram", hook: "Story open", score: "1.8×" },
];

const FAQS = [
  {
    q: "Which platforms does Outlier support?",
    a: "TikTok, Instagram, and YouTube — a single creator can be tracked across any combination of them under one card.",
  },
  {
    q: "How is the score calculated?",
    a: "Against the creator's own running median views, not a universal benchmark — so a small account's breakout post scores the same way a large account's does.",
  },
  {
    q: "Does it write scripts for me?",
    a: "No. It shows you the structure of what worked — hook, beats, hook style — so you can write the next one with that in mind.",
  },
];

export async function OutlierHomePage() {
  const headerList = await headers();
  const loginHref = serverProductHref(headerList, "root", "/login");
  const dashboardHref = serverDashboardHref(headerList, "outlier");
  const isLoggedIn = Boolean(await getUser());

  return (
    <div className={styles.creosHome}>
      <OutlierHeader isLoggedIn={isLoggedIn} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.wrap} ${styles.heroGrid}`}>
            <div>
              <Reveal>
                <span className={styles.label}>
                  Outlier / Content intelligence <span className={styles.status}>Live, early access</span>
                </span>
                <h1 className={styles.display}>
                  <span>Find what&rsquo;s</span>
                  <span>breaking</span>
                  <span>out.</span>
                </h1>
                <p className={styles.lede}>
                  <span>Track creators across TikTok, Instagram and YouTube.</span>
                  <span>Every post scored against its own running median.</span>
                  <span>See why it worked, not just that it did.</span>
                </p>
                <div className={styles.prod}>
                  <a href="#how">
                    HOW IT WORKS <span className={styles.arrow}>↗</span>
                  </a>
                  <a href="#score">
                    THE SCORE <span className={styles.arrow}>↗</span>
                  </a>
                  <a href="#pricing">
                    PRICING <span className={styles.arrow}>↗</span>
                  </a>
                </div>
              </Reveal>
            </div>

            <aside className={styles.feed} aria-label="Live outlier feed">
              <div className={`${styles.feedHead} ${styles.label}`}>
                <span className={styles.live} aria-hidden="true" />
                Live outliers
              </div>
              <div className={styles.entry}>
                <span className={styles.label}>01 / Breakout</span>
                <p className={`${styles.big} ${styles.bigNum}`}>41×</p>
                <p className={styles.meta}>
                  Score. Competitor reel at 12.6M views
                  <br />
                  against a 310K running median.
                </p>
                <svg className={styles.spark} viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
                  <line x1={0} y1={54} x2={300} y2={54} stroke="#6F6E6A" strokeDasharray="3 5" />
                  <path d="M0 56 C60 55 110 53 150 48 S220 30 250 16 S290 3 300 2" />
                </svg>
              </div>
              <div className={styles.entry}>
                <span className={styles.label}>02 / Why it worked</span>
                <p className={`${styles.big} ${styles.bigWord}`}>Pattern interrupt</p>
                <p className={styles.meta}>Hook → reveal → payoff</p>
                <div className={styles.beatBar} style={{ gridTemplateColumns: "2fr 4fr 5fr" }}>
                  <div />
                  <div />
                  <div />
                </div>
                <div className={styles.beatBarLabels} style={{ gridTemplateColumns: "2fr 4fr 5fr" }}>
                  <span>0–2 s</span>
                  <span>2–6 s</span>
                  <span>6–11 s</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.loop} id="how" aria-label="How Outlier works">
          <div className={styles.wrap}>
            <div>
              <b>Add</b>
              <p>One card per creator, across every platform they&rsquo;re on.</p>
            </div>
            <div>
              <b>Pull</b>
              <p>Bring in their latest posts whenever you need them.</p>
            </div>
            <div>
              <b>Score</b>
              <p>Every post against that creator&rsquo;s own running median.</p>
            </div>
            <div>
              <b>Understand</b>
              <p>Hook, beats and structure, auto-transcribed.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.sec} ${styles.demo}`}>
          <div className={`${styles.wrap} ${styles.secHead}`}>
            <span className={styles.label}>See it in action</span>
            <h2 className={styles.display}>
              <span>Your competitors</span>
              <span>are telling you</span>
              <span>what works.</span>
            </h2>
            <div className={styles.intro}>
              <p>
                Track the creators and brands in your space. Every post is scored against its own running median, so
                you see what&rsquo;s breaking out while it&rsquo;s still climbing.
              </p>
              <a href="#pricing">
                Start tracking <span className={styles.arrow}>↗</span>
              </a>
            </div>
          </div>
          <Reveal scale>
            <OutlierDemoPanel />
          </Reveal>
        </section>

        <section className={styles.sec}>
          <div className={styles.wrap}>
            <span className={styles.label}>How it works</span>
            <h2 className={styles.display}>
              <span>Three steps.</span>
              <span>No dashboards</span>
              <span>you don&rsquo;t need.</span>
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

        <section className={styles.sec} id="score">
          <div className={styles.wrap}>
            <span className={styles.label}>The score</span>
            <h2 className={styles.display}>
              <span>Their normal.</span>
              <span>Not everyone</span>
              <span>else&rsquo;s.</span>
            </h2>
            <div className={styles.plan}>
              <div>
                <ul className={`${styles.rows} ${styles.scoreRows}`}>
                  <li>
                    <b>Small account</b>
                    <span>96K views ÷ 8K median</span>
                    <em>12×</em>
                  </li>
                  <li>
                    <b>Large account</b>
                    <span>1.8M views ÷ 900K median</span>
                    <em>2×</em>
                  </li>
                </ul>
                <p className={styles.caption}>Illustrative example.</p>
              </div>
              <div className={styles.scoreExplain}>
                <small>Outlier score</small>
                <p className={styles.formula}>
                  Post views
                  <br />
                  <span>÷</span> their running median
                </p>
                <p>
                  A small account&rsquo;s breakout scores the same way a large account&rsquo;s does — so you spot the
                  post that&rsquo;s working before it&rsquo;s obviously a hit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sec} id="feed">
          <div className={styles.wrap}>
            <span className={styles.label}>One feed</span>
            <div className={styles.intro} style={{ marginTop: 0 }}>
              <h2 className={styles.display}>
                <span>Every post.</span>
                <span>Ranked.</span>
              </h2>
              <p>
                Every tracked creator&rsquo;s posts in one feed — sorted by score, filtered by platform, live the
                moment you pull.
              </p>
            </div>
            <div className={styles.feedTabs}>
              <span className={styles.active}>All</span>
              <span>TikTok</span>
              <span>Instagram</span>
              <span>YouTube</span>
            </div>
            <div className={styles.feedTable}>
              {FEED_ROWS.map((row) => (
                <div className={styles.feedRow} key={row.rank}>
                  <span className={styles.feedRank}>{row.rank}</span>
                  <span>
                    {row.title} <span className={styles.feedCreator}>— {row.creator}</span>
                  </span>
                  <span className={styles.feedMeta}>{row.platform}</span>
                  <span className={styles.feedMeta}>{row.hook}</span>
                  <span className={styles.feedScore}>{row.score}</span>
                </div>
              ))}
            </div>
            <p className={styles.caption}>Sample data.</p>
          </div>
        </section>

        <section className={styles.sec} id="pricing">
          <div className={styles.wrap}>
            <h2 className={styles.display}>
              <span>Outlier comes</span>
              <span>with Creos.</span>
            </h2>
            <div className={styles.plan}>
              <ul className={styles.rows}>
                <li>
                  <b>Outlier</b>
                  <span>Content intelligence</span>
                  <em>Included</em>
                </li>
                <li>
                  <b>Signal</b>
                  <span>Creative analysis</span>
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
              <span>Running Outlier for multiple brands? We&rsquo;re working with selected teams and agencies.</span>
              <a href="mailto:hello@creos-labs.com?subject=Outlier%20for%20teams">Talk to us</a>
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
                    <h3>Already using Outlier?</h3>
                    <p>
                      You&rsquo;re signed in. <Link href={dashboardHref}>Go to Dashboard</Link>
                    </p>
                  </>
                ) : (
                  <>
                    <h3>Already using Outlier?</h3>
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
              <span>Stop guessing.</span>
              <span>Start tracking.</span>
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
