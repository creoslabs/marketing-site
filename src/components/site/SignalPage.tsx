import Link from "next/link";
import { headers } from "next/headers";
import styles from "./site.module.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Faq, type FaqItem } from "./Faq";
import { Journey, type JourneyStage } from "./Journey";
import { PricingSection, ProductClose } from "./ProductSections";
import { IntegrationsLine } from "./IntegrationsBand";
import { Accent, Asterisk, Avatar, Emoji, Eyebrow, Grey, Mono, PillLinks, ProductBadge, cx } from "./ui";
import { serverProductHref, serverDashboardHref } from "@/lib/product-links";
import { getUser } from "@/lib/supabase/data";

const SCATTER: Array<[number, number]> = [
  [4, 6],
  [12, 14],
  [20, 4],
  [28, 18],
  [36, 10],
  [44, 22],
  [52, 8],
  [60, 16],
  [68, 26],
  [76, 12],
];

const JOURNEY: JourneyStage[] = [
  {
    label: "01 · Upload",
    caption: "One asset or a whole round, before it goes live.",
    card: (
      <>
        <div className={styles.stageUser}>
          <Emoji className={styles.fileThumb}>🧴</Emoji>
          <div className={styles.stageName}>
            <b>serum_15s.mp4</b>
            <small>9:16 · before launch</small>
          </div>
        </div>
        <div className={styles.uploadBar} />
      </>
    ),
  },
  {
    label: "02 · Score",
    caption: "Checked tier by tier against format-specific criteria.",
    card: (
      <>
        <div className={styles.stageBigRow}>
          <span className={cx(styles.disp, styles.stageBig)}>82</span>
          <Mono>/100</Mono>
        </div>
        <div className={styles.countPills}>
          <span>6 pass</span>
          <span>2 partial</span>
          <span>1 fail</span>
        </div>
      </>
    ),
  },
  {
    label: "03 · Benchmark",
    caption: "Placed against everything you’ve analysed in that format.",
    card: (
      <>
        <div className={styles.scatter} aria-hidden="true">
          {SCATTER.map(([left, bottom]) => (
            <i key={left} style={{ left: `${left}%`, bottom }} />
          ))}
          <i className={styles.scatterMe} style={{ left: "88%", bottom: 20 }} />
        </div>
        <span className={styles.quote} style={{ fontSize: 11 }}>
          Top 10% of your 24 other 9:16 assets
        </span>
      </>
    ),
  },
  {
    label: "04 · Fix",
    caption: "Know which beat to change before you spend a dollar.",
    card: (
      <>
        <div className={styles.stageFix}>
          <span className={styles.fixOld}>Two offers in the last 3 s</span>
          <span className={styles.fixNew}>→ One clear CTA</span>
        </div>
        <Mono className={styles.fixBeat}>Beat 12–15 s</Mono>
      </>
    ),
  },
];

const BEATS = [
  { flex: 20, tone: styles.beatA, name: "Problem", time: "0–3 s" },
  { flex: 40, tone: styles.beatB, name: "Demonstration", time: "3–9 s" },
  { flex: 40, tone: styles.beatC, name: "Proof", time: "9–15 s" },
];

const CRITERIA = [
  { emoji: "✅", title: "Hook lands in the first 1.5 s", note: "Lands at 1.2 s", verdict: "Pass" },
  { emoji: "✅", title: "Pain named on screen", note: "Text overlay in frame one", verdict: "Pass" },
  { emoji: "⚠️", title: "Face or product in the first frame", note: "Face enters at 0.8 s", verdict: "Partial", hot: true },
];

const STEPS = [
  { emoji: "🎯", title: "Score", body: "Every asset checked tier by tier against format-specific criteria." },
  {
    emoji: "📊",
    title: "Benchmark",
    body: "Every score placed against every other asset you’ve analysed in that format, so a number means something concrete.",
  },
  { emoji: "🗂️", title: "Review", body: "Upload a whole round of creative at once and see every score land side by side." },
];

const ROUND = [
  { title: "Hydration serum — problem/solution", format: "9:16 video", flag: "Two competing CTAs", score: 82, thumb: "🧴", square: false },
  { title: "Hydration serum — founder story", format: "9:16 video", flag: "Hook lands at 2.4 s", score: 74, thumb: "🧴", square: false },
  { title: "Hydration serum — UGC review", format: "9:16 video", flag: "No product in first frame", score: 69, thumb: "🧴", square: false },
  { title: "Before/after carousel", format: "1:1 static", flag: "Benefit needs sound", score: 63, thumb: "🖼️", square: true },
  { title: "Offer banner", format: "1:1 static", flag: "Brand missing in final frame", score: 51, thumb: "🖼️", square: true },
];

export async function SignalPage() {
  const headerList = await headers();
  const loginHref = serverProductHref(headerList, "root", "/login");
  const dashboardHref = serverDashboardHref(headerList, "signal");
  const isLoggedIn = Boolean(await getUser());

  const faqs: FaqItem[] = [
    {
      q: "Which formats can Signal score?",
      a: "Static images and video ads — each format is scored against its own criteria, so a video score and a static score are never averaged together.",
    },
    {
      q: "What does the score compare against?",
      a: "Every other asset you’ve analysed in that format — so an 82 tells you where this ad sits in your own work, not an abstract average.",
    },
    {
      q: "Can I review a whole campaign at once?",
      a: "Yes. Upload a round of creative together and every score lands side by side.",
    },
    {
      q: "Already using Signal?",
      a: isLoggedIn ? (
        <>
          You’re signed in. <Link href={dashboardHref}>Go to Dashboard →</Link>
        </>
      ) : (
        <>
          Sign in with your Creos Labs account. <Link href={loginHref}>Log in →</Link>
        </>
      ),
    },
  ];

  return (
    <div className={styles.site}>
      <SiteHeader product="signal" isLoggedIn={isLoggedIn} />
      <main>
        <section className={cx(styles.wrap, styles.pHero)}>
          <div className={styles.pHeroRow}>
            <div className={styles.pHeroCopy}>
              <ProductBadge emoji="🎯">Signal / Creative analysis</ProductBadge>
              <h1 className={cx(styles.disp, styles.h1Prod)}>
                Know <Accent>before</Accent> you spend.
              </h1>
              <p className={styles.pLede}>
                Upload creative before you publish. Every asset checked beat by beat against format-specific criteria. Every score
                benchmarked against everything you’ve made.
              </p>
              <PillLinks
                links={[
                  { href: "#how", label: "How it works" },
                  { href: "#demo", label: "See a breakdown" },
                  { href: "#access", label: "Early access" },
                ]}
              />
            </div>

            <div className={styles.pHeroCard}>
              <div className={styles.liveCard}>
                <div className={styles.liveHead}>
                  <Mono>● Live analysis</Mono>
                  <Asterisk size={20} light />
                </div>
                <div className={cx(styles.liveItem, styles.liveItemHot)}>
                  <Mono>01 / Score</Mono>
                  <div className={styles.bigScoreRow}>
                    <Emoji className={styles.thumbPhone}>🧴</Emoji>
                    <span className={cx(styles.disp, styles.bigScore)}>82</span>
                    <Mono className={styles.bigScoreOf}>/100</Mono>
                  </div>
                  <p className={styles.liveText}>
                    Hydration serum, 15 s vertical. <b>Top 10%</b> of your 24 other 9:16 assets.
                  </p>
                </div>
                <div className={styles.liveItem}>
                  <Mono>02 / Flagged</Mono>
                  <div className={styles.liveTitleRow}>
                    <span className={styles.liveTitle}>One clear CTA</span>
                    <Emoji style={{ fontSize: 20 }}>⚠️</Emoji>
                  </div>
                  <p className={styles.liveSmall}>Two offers compete in the last 3 s.</p>
                  <div className={styles.flagPills}>
                    <span>
                      <Emoji style={{ fontSize: 12 }}>✅</Emoji>6 pass
                    </span>
                    <span>
                      <Emoji style={{ fontSize: 12 }}>⚠️</Emoji>2 partial
                    </span>
                    <span>
                      <Emoji style={{ fontSize: 12 }}>❌</Emoji>1 fail
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Journey title="One ad, from upload to fix" stages={JOURNEY} />
        </section>

        <IntegrationsLine>Share scorecards to Slack, Notion or Sheets so the team sees the fails before launch.</IntegrationsLine>

        <section id="demo" className={cx(styles.sec, styles.secRule)}>
          <div className={styles.wrap}>
            <div className={styles.split}>
              <div className={styles.col}>
                <Eyebrow>See it in action</Eyebrow>
                <h2 className={cx(styles.disp, styles.h2)}>
                  Your ads have more to say than <Accent>ROAS.</Accent>
                </h2>
                <p className={styles.leadD}>
                  Upload creative before you publish. Signal checks it beat by beat against what tends to hold attention, and benchmarks the
                  score against everything you’ve made before.
                </p>
                <a href="#access" className={cx(styles.btn, styles.btnPaper, styles.btnMobFull)} style={{ alignSelf: "flex-start" }}>
                  Request access ↗
                </a>
              </div>

              <div className={cx(styles.col, styles.colWide)}>
                <div className={styles.demoPanel}>
                  <div className={styles.demoThumb}>
                    <Emoji>👩🏽</Emoji>
                    <span className={styles.demoThumbCap}>Dry skin by 3pm?</span>
                    <Mono className={styles.demoThumbTag}>9:16 · 0:00</Mono>
                    <Emoji className={styles.demoThumbEmoji}>🧴</Emoji>
                  </div>
                  <div className={styles.demoMain}>
                    <div className={styles.demoTitle}>
                      <b>Hydration serum, 15 s vertical</b>
                      <Mono>Scored against 9:16 video criteria, before launch</Mono>
                    </div>
                    <div className={styles.scoreStrip}>
                      <span className={styles.disp}>82</span>
                      <div>
                        <Mono>/100</Mono>
                        <span>Top 10% of your 24 other 9:16 assets</span>
                      </div>
                    </div>
                    <div className={styles.beatBars}>
                      {BEATS.map((b) => (
                        <div key={b.name} className={styles.beat} style={{ flex: `${b.flex} 1 0` }}>
                          <i className={b.tone} />
                          <b>{b.name}</b>
                          <Mono>{b.time}</Mono>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ul className={styles.critList} style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {CRITERIA.map((c) => (
                      <li key={c.title} className={cx(styles.crit, c.hot && styles.critHot)}>
                        <Emoji>{c.emoji}</Emoji>
                        <div className={styles.critText}>
                          <b>{c.title}</b>
                          <span>{c.note}</span>
                        </div>
                        <Mono>{c.verdict}</Mono>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className={cx(styles.stepsSec, styles.secLight)}>
          <div className={styles.wrap}>
            <Eyebrow tone="light">How it works</Eyebrow>
            <h2 className={cx(styles.disp, styles.h2)}>
              Check it before <Grey>the market does.</Grey>
            </h2>
            <div className={styles.stepsGrid}>
              {STEPS.map((s, i) => (
                <div key={s.title} className={styles.step}>
                  <div className={styles.stepTop}>
                    <span className={cx(styles.disp, styles.stepNum)}>{String(i + 1).padStart(2, "0")}</span>
                    <Avatar>{s.emoji}</Avatar>
                  </div>
                  <h3 className={styles.disp}>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="round" className={cx(styles.feedSec, styles.secLight)}>
          <div className={styles.wrap}>
            <div className={styles.feedHead}>
              <div className={styles.feedTitle}>
                <Eyebrow tone="light">Review a round</Eyebrow>
                <h2 className={cx(styles.disp, styles.h2)}>
                  Every asset. <Grey>Side by side.</Grey>
                </h2>
              </div>
              <p className={cx(styles.leadL, styles.feedIntro)}>
                Upload a whole round of creative at once. See which one to run, and which beat is holding the others back.
              </p>
            </div>
            <ol className={styles.rankList} style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {ROUND.map((row, i) => (
                <li key={row.title} className={cx(styles.rank, i === 0 && styles.rankHot)}>
                  <span className={cx(styles.disp, styles.rankNum)}>{String(i + 1).padStart(2, "0")}</span>
                  <Emoji className={row.square ? styles.rankThumbSq : styles.rankThumb}>{row.thumb}</Emoji>
                  <div className={styles.rankMain}>
                    <span className={styles.rankTitle}>{row.title}</span>
                    <div className={styles.rankMeta}>
                      <Mono className={styles.chipLight}>{row.format}</Mono>
                      <span>⚑ {row.flag}</span>
                    </div>
                  </div>
                  <div className={styles.rankBarCol}>
                    <div className={cx(styles.rankBar, i === 0 && styles.rankBarHot)} aria-hidden="true">
                      <i style={{ width: `${row.score}%` }} />
                    </div>
                    <span className={cx(styles.disp, styles.rankScoreSig)}>
                      {row.score}
                      <Mono className={styles.rankOf}>/100</Mono>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            <Mono className={styles.caption}>Sample data.</Mono>
          </div>
        </section>

        <PricingSection
          product="signal"
          teamsCopy="Reviewing creative for multiple brands? We’re working with selected teams and agencies."
        />

        <Faq items={faqs} />

        <ProductClose sub="Outlier, Signal, and everything we’re experimenting with next.">
          Check it.
          <br />
          <Accent>Then ship it.</Accent>
        </ProductClose>
      </main>
      <SiteFooter variant="product" />
    </div>
  );
}
