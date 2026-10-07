import Link from "next/link";
import { headers } from "next/headers";
import styles from "./site.module.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Faq, type FaqItem } from "./Faq";
import { Journey, type JourneyStage } from "./Journey";
import { PricingSection, ProductClose } from "./ProductSections";
import { Accent, Asterisk, Avatar, Emoji, Eyebrow, Grey, Mono, PillLinks, ProductBadge, cx } from "./ui";
import { serverProductHref, serverDashboardHref } from "@/lib/product-links";
import { getUser } from "@/lib/supabase/data";

const BEATS = [
  { flex: 18, tone: styles.beatA, name: "Hook", time: "0–2 s" },
  { flex: 36, tone: styles.beatB, name: "Reveal", time: "2–6 s" },
  { flex: 46, tone: styles.beatC, name: "Payoff", time: "6–11 s" },
];

const JOURNEY: JourneyStage[] = [
  {
    label: "01 · Add",
    caption: "One card per creator, across every platform they’re on.",
    card: (
      <>
        <div className={styles.stageUser}>
          <Avatar>🧔🏾</Avatar>
          <div className={styles.stageName}>
            <b>@creator_one</b>
            <small>One card</small>
          </div>
        </div>
        <div className={styles.platformRow}>
          {["TikTok", "IG", "YT"].map((p) => (
            <Mono key={p} className={styles.chipWhite}>
              {p}
            </Mono>
          ))}
        </div>
      </>
    ),
  },
  {
    label: "02 · Pull",
    caption: "Bring in their latest posts whenever you need them.",
    card: (
      <>
        <div className={styles.tiles}>
          {["🎬", "🗂️", "🎬", "🎬"].map((e, i) => (
            <span key={i}>
              <Emoji>{e}</Emoji>
            </span>
          ))}
        </div>
        <span className={styles.stageNote}>Latest posts, on demand</span>
      </>
    ),
  },
  {
    label: "03 · Score",
    caption: "Every post against that creator’s own running median.",
    card: (
      <>
        <div className={styles.stageBigRow}>
          <span className={cx(styles.disp, styles.stageBig)}>41×</span>
        </div>
        <div className={styles.medianBar}>
          <i />
          <b />
        </div>
        <span className={styles.stageNote}>vs their own running median</span>
      </>
    ),
  },
  {
    label: "04 · Understand",
    caption: "Hook, beats and structure, auto-transcribed.",
    card: (
      <>
        <span className={styles.quote}>“Nobody tells you this before you launch…”</span>
        <div className={styles.beatStrip}>
          {BEATS.map((b) => (
            <i key={b.name} className={b.tone} style={{ flex: `${b.flex} 1 0` }} />
          ))}
        </div>
        <span className={styles.stageNote}>Hook · reveal · payoff</span>
      </>
    ),
  },
];

const CHART = [
  { h: 12, o: 0.35 },
  { h: 30, o: 0.45 },
  { h: 48, o: 0.55 },
  { h: 66, o: 0.65 },
  { h: 80, o: 0.75 },
  { h: 90, o: 0.85 },
  { h: 100, o: 0.95, hot: true },
];

const STEPS = [
  {
    emoji: "👥",
    title: "Add creators",
    body: "Track a creator across TikTok, Instagram, and YouTube — one card per person, however many platforms they’re on.",
  },
  {
    emoji: "📈",
    title: "Pull posts",
    body: "Outlier scores every post against that creator’s own running median, not a universal benchmark.",
  },
  {
    emoji: "📝",
    title: "Go deeper",
    body: "Auto-transcribe any post and see its hook, structure, and beats — why it worked, not just that it did.",
  },
];

const FEED = [
  {
    title: "Launch mistakes nobody mentions",
    creator: "Creator A",
    platform: "Instagram",
    hook: "Pattern interrupt",
    score: "41×",
    who: "👩🏻",
  },
  { title: "I tested 5 hooks on one product", creator: "Creator B", platform: "TikTok", hook: "Challenge", score: "11.2×", who: "🧑🏽" },
  { title: "Why this ad actually converted", creator: "Creator C", platform: "YouTube", hook: "Contrarian", score: "6.4×", who: "👨🏻‍🦱" },
  { title: "The 3-second rule for reels", creator: "Creator A", platform: "TikTok", hook: "Listicle", score: "3.1×", who: "👩🏻" },
  { title: "Behind the rebrand", creator: "Creator D", platform: "Instagram", hook: "Story open", score: "1.8×", who: "👩🏼‍🦰" },
];

export async function OutlierPage() {
  const headerList = await headers();
  const loginHref = serverProductHref(headerList, "root", "/login");
  const dashboardHref = serverDashboardHref(headerList, "outlier");
  const isLoggedIn = Boolean(await getUser());

  const faqs: FaqItem[] = [
    {
      q: "Which platforms does Outlier support?",
      a: "TikTok, Instagram, and YouTube — a single creator can be tracked across any combination of them under one card.",
    },
    {
      q: "How is the score calculated?",
      a: "Against the creator’s own running median views, not a universal benchmark — so a small account’s breakout post scores the same way a large account’s does.",
    },
    {
      q: "Does it write scripts for me?",
      a: "No. It shows you the structure of what worked — hook, beats, hook style — so you can write the next one with that in mind.",
    },
    {
      q: "Already using Outlier?",
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
      <SiteHeader product="outlier" isLoggedIn={isLoggedIn} />
      <main>
        <section className={cx(styles.wrap, styles.pHero)}>
          <div className={styles.pHeroRow}>
            <div className={styles.pHeroCopy}>
              <ProductBadge emoji="🔭">Outlier / Content intelligence</ProductBadge>
              <h1 className={cx(styles.disp, styles.h1Prod)}>
                Find what’s <Accent>breaking out.</Accent>
              </h1>
              <p className={styles.pLede}>
                Track creators across TikTok, Instagram and YouTube. Every post scored against its own running median. See why it worked,
                not just that it did.
              </p>
              <PillLinks
                links={[
                  { href: "#how", label: "How it works" },
                  { href: "#score", label: "The score" },
                  { href: "#pricing", label: "Pricing" },
                ]}
              />
            </div>

            <div className={styles.pHeroCard}>
              <div className={styles.liveCard}>
                <div className={styles.liveHead}>
                  <Mono>● Live outliers</Mono>
                  <Asterisk size={20} light />
                </div>
                <div className={cx(styles.liveItem, styles.liveItemHot)}>
                  <Mono>01 / Breakout</Mono>
                  <div className={styles.bigScoreRow}>
                    <Avatar size={52}>🧔🏾</Avatar>
                    <span className={cx(styles.disp, styles.bigScore)}>41×</span>
                  </div>
                  <p className={styles.liveText}>
                    Competitor reel at <b>12.6M</b> views against a <b>310K</b> running median.
                  </p>
                </div>
                <div className={styles.liveItem}>
                  <Mono>02 / Why it worked</Mono>
                  <div className={styles.liveTitleRow}>
                    <span className={styles.liveTitle}>Pattern interrupt</span>
                    <Emoji style={{ fontSize: 20 }}>⚡</Emoji>
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
              </div>
            </div>
          </div>

          <Journey title="One competitor reel, start to finish" stages={JOURNEY} />
        </section>

        <section id="demo" className={cx(styles.sec, styles.secRule)}>
          <div className={styles.wrap}>
            <div className={styles.split}>
              <div className={styles.col}>
                <Eyebrow>See it in action</Eyebrow>
                <h2 className={cx(styles.disp, styles.h2)}>
                  Your competitors are telling you <Accent>what works.</Accent>
                </h2>
                <p className={styles.leadD}>
                  Track the creators and brands in your space. Every post is scored against its own running median, so you see what’s
                  breaking out while it’s still climbing.
                </p>
                <a href="#pricing" className={cx(styles.btn, styles.btnPaper, styles.btnMobFull)} style={{ alignSelf: "flex-start" }}>
                  Start tracking ↗
                </a>
              </div>

              <div className={cx(styles.col, styles.colWide)}>
                <div className={styles.demoPanel}>
                  <div className={cx(styles.demoThumb, styles.demoThumbOutlier)}>
                    <Emoji>🧔🏾</Emoji>
                    <Mono className={styles.demoThumbTag}>Reel</Mono>
                    <Mono className={styles.demoThumbBadge}>Breakout</Mono>
                  </div>
                  <div className={styles.demoMain}>
                    <div className={styles.demoTitle}>
                      <b>Competitor reel</b>
                      <Mono>Instagram · posted 7 days ago</Mono>
                    </div>
                    <div className={styles.statGrid}>
                      {[
                        ["Views", "12.6M"],
                        ["Running median", "310K"],
                        ["Score", "41×", true],
                        ["Last 24 hours", "+903K"],
                      ].map(([label, value, hot]) => (
                        <div key={label as string} className={cx(styles.stat, hot && styles.statHot)}>
                          <Mono>{label as string}</Mono>
                          <span className={styles.disp}>{value as string}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.chartBox}>
                      <div className={styles.chart}>
                        {CHART.map((c, i) => (
                          <i key={i} style={{ height: `${c.h}%`, opacity: c.o, background: c.hot ? "var(--accent)" : undefined }} />
                        ))}
                        <span className={styles.chartMedian} aria-hidden="true" />
                        <Mono className={styles.chartMedianLabel}>Their running median</Mono>
                      </div>
                      <div className={styles.chartAxis} aria-hidden="true">
                        {["Posted", "D2", "D3", "D4", "D5", "D6", "D7"].map((d) => (
                          <Mono key={d}>{d}</Mono>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.demoFoot}>
                    <div className={styles.demoNote}>
                      <Mono>Hook style</Mono>
                      <b>⚡ Pattern interrupt</b>
                      <span>Hook 0–2 s · Reveal 2–6 s · Payoff 6–11 s</span>
                    </div>
                    <div className={cx(styles.demoNote, styles.demoNoteDark)}>
                      <Mono>Opening line, auto-transcribed</Mono>
                      <span>“Nobody tells you this before you launch a skincare brand.”</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className={cx(styles.stepsSec, styles.secLight)}>
          <div className={styles.wrap}>
            <Eyebrow tone="light">How it works</Eyebrow>
            <h2 className={cx(styles.disp, styles.h2)}>
              Three steps. <Grey>No dashboards you don’t need.</Grey>
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

        <section id="score" className={cx(styles.sec, styles.secRule)}>
          <div className={styles.wrap}>
            <div className={styles.split}>
              <div className={styles.col}>
                <Eyebrow>The score</Eyebrow>
                <h2 className={cx(styles.disp, styles.h2)}>
                  Their normal. <Accent>Not everyone else’s.</Accent>
                </h2>
                <p className={styles.leadD}>
                  A small account’s breakout scores the same way a large account’s does — so you spot the post that’s working before it’s
                  obviously a hit.
                </p>
              </div>
              <div className={cx(styles.col, styles.colWide)} style={{ flexBasis: 480 }}>
                <div className={styles.explain}>
                  <div className={styles.formula}>
                    <Mono>Outlier score</Mono>
                    <div className={styles.formulaLines}>
                      <span>Post views</span>
                      <i />
                      <span>Their running median</span>
                    </div>
                  </div>
                  <div className={styles.exRow}>
                    <Avatar>🧑🏽</Avatar>
                    <div className={styles.exText}>
                      <b>Small account</b>
                      <span>96K views ÷ 8K median</span>
                    </div>
                    <span className={cx(styles.disp, styles.exMult)}>12×</span>
                  </div>
                  <div className={styles.exRow}>
                    <Avatar>👨🏻‍🦱</Avatar>
                    <div className={styles.exText}>
                      <b>Large account</b>
                      <span>1.8M views ÷ 900K median</span>
                    </div>
                    <span className={cx(styles.disp, styles.exMult)}>2×</span>
                  </div>
                  <Mono className={styles.caption}>Illustrative example.</Mono>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="feed" className={cx(styles.feedSec, styles.secLight)}>
          <div className={styles.wrap}>
            <div className={styles.feedHead}>
              <div className={styles.feedTitle}>
                <Eyebrow tone="light">One feed</Eyebrow>
                <h2 className={cx(styles.disp, styles.h2)}>
                  Every post. <Grey>Ranked.</Grey>
                </h2>
              </div>
              <p className={cx(styles.leadL, styles.feedIntro)}>
                Every tracked creator’s posts in one feed — sorted by score, filtered by platform, live the moment you pull.
              </p>
            </div>
            <div className={styles.filterRow} aria-hidden="true">
              {["All", "TikTok", "Instagram", "YouTube"].map((f, i) => (
                <Mono key={f} className={cx(styles.filter, i === 0 && styles.filterOn)}>
                  {f}
                </Mono>
              ))}
            </div>
            <ol className={styles.rankList} style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {FEED.map((row, i) => (
                <li key={row.title} className={cx(styles.rank, i === 0 && styles.rankHot)}>
                  <span className={cx(styles.disp, styles.rankNum)}>{String(i + 1).padStart(2, "0")}</span>
                  <Avatar>{row.who}</Avatar>
                  <div className={styles.rankMain}>
                    <span className={styles.rankTitle}>{row.title}</span>
                    <div className={styles.rankMeta}>
                      <span>{row.creator}</span>
                      <Mono className={styles.chipLight}>{row.platform}</Mono>
                      <Mono className={cx(styles.chipLight, styles.rankHook)}>{row.hook}</Mono>
                    </div>
                  </div>
                  <span className={cx(styles.disp, styles.rankScore)}>{row.score}</span>
                </li>
              ))}
            </ol>
            <Mono className={styles.caption}>Sample data.</Mono>
          </div>
        </section>

        <PricingSection
          product="outlier"
          teamsCopy="Running Outlier for multiple brands? We’re working with selected teams and agencies."
        />

        <Faq items={faqs} />

        <ProductClose sub="Outlier, Signal, and everything we’re experimenting with next.">
          Stop guessing.
          <br />
          <Accent>Start tracking.</Accent>
        </ProductClose>
      </main>
      <SiteFooter variant="product" />
    </div>
  );
}
