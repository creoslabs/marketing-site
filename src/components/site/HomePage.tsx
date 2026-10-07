import styles from "./site.module.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { HomeHero } from "./HomeHero";
import { TryLink } from "./TryLink";
import { Accent, Asterisk, Avatar, AvatarStack, ENQUIRE_HREF, Emoji, Eyebrow, Mono, cx } from "./ui";

// Prices for the three scoped builds. Left empty on purpose: the design handoff
// has a `From [PRICE]` placeholder here and the real numbers haven't been
// supplied. While a price is null the card says "Enquire for pricing" instead of
// showing a made-up number or the raw placeholder.
const SERVICE_PRICES: { reporting: string | null; tracking: string | null; agents: string | null } = {
  reporting: null,
  tracking: null,
  agents: null,
};

function Price({ value }: { value: string | null }) {
  return <Mono className={styles.servicePrice}>{value ? `From ${value}` : "Enquire for pricing"}</Mono>;
}

const PILLS_SIGNAL = ["Video + static", "Meta · TikTok · YouTube", "Pre-publish"];
const PILLS_OUTLIER = ["Creator watchlists", "Auto-transcribed", "No account connection"];

const CHECKLIST = [
  { emoji: "✅", label: "Hook in first 3 seconds", verdict: "Pass" },
  { emoji: "✅", label: "Captions on", verdict: "Pass" },
  { emoji: "⚠️", label: "Brand shown early", verdict: "Partial", hot: true },
  { emoji: "❌", label: "Text inside safe zone", verdict: "Fail" },
];

const WATCHLIST = [
  { who: "🧔🏾", handle: "@creator_one · Reel", quote: "“Nobody tells you this about…”", mult: "6.2×", fill: 92, hot: true },
  { who: "👩🏼‍🦰", handle: "@creator_two · Carousel", quote: "“3 things I’d do differently”", mult: "1.4×", fill: 21 },
  { who: "👩🏻", handle: "@creator_three · Reel", quote: "“Day in the life, honest version”", mult: "0.9×", fill: 13 },
];

export function HomePage() {
  return (
    <div className={styles.site}>
      <SiteHeader />
      <main>
        <HomeHero />

        <section id="how" className={styles.howHome}>
          <div className={styles.wrap}>
            <Eyebrow tone="dim">01. How it works</Eyebrow>
            <div className={styles.howGrid}>
              <div className={styles.howCard}>
                <div className={styles.howIcon} aria-hidden="true">
                  <Avatar>🧑🏽‍💻</Avatar>
                  <Avatar>👩🏻‍💼</Avatar>
                </div>
                <div className={styles.howBody}>
                  <h3 className={styles.disp}>Your people.</h3>
                  <p>Your team, your creators, your data. The messy inputs every marketing function already has.</p>
                </div>
              </div>
              <div className={cx(styles.howCard, styles.howCardHot)}>
                <div className={styles.hubIcon} aria-hidden="true">
                  <Asterisk size={28} />
                </div>
                <div className={styles.howBody}>
                  <h3 className={styles.disp}>Our system.</h3>
                  <p>A product off the shelf, or software we build around how you already work.</p>
                </div>
              </div>
              <div className={styles.howCard}>
                <div className={styles.howIcon} aria-hidden="true">
                  <Avatar>🏆</Avatar>
                </div>
                <div className={styles.howBody}>
                  <h3 className={styles.disp}>Better calls.</h3>
                  <p>Clear answers on what’s working, so you scale winners instead of guessing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className={styles.sec}>
          <div className={styles.wrap}>
            <div className={styles.productsHead}>
              <div className={styles.productsTitle}>
                <Eyebrow tone="dim">02. Products</Eyebrow>
                <h2 className={cx(styles.disp, styles.h2Products)}>
                  Two tools.
                  <br />
                  <Accent>More coming.</Accent>
                </h2>
              </div>
              <div className={styles.productsAside}>
                <p>Check your creative before it runs. Study what’s working for everyone else. Use one, or both.</p>
                <div className={styles.foundRow}>
                  <AvatarStack people={["👩🏻", "🧔🏾", "👩🏼‍🦰"]} />
                  <Mono>Founding access open</Mono>
                </div>
              </div>
            </div>

            <div className={styles.productGrid}>
              {/* SIGNAL */}
              <article className={styles.pcard}>
                <div className={styles.pcardTop}>
                  <div className={styles.pcardTitleBox}>
                    <Mono className={styles.pcardKicker}>01 · Ad creative intelligence</Mono>
                    <h3 className={cx(styles.disp, styles.pcardTitle)}>Signal</h3>
                  </div>
                  <Emoji className={styles.pcardEmoji}>🎯</Emoji>
                </div>
                <p className={styles.pcardDesc}>
                  Score your ads against platform best practice <span>before you spend a dollar on them.</span>
                </p>

                <div className={cx(styles.preview, styles.sigPreview)}>
                  <div className={styles.sigThumbCol}>
                    <div className={styles.sigThumb}>
                      <Emoji style={{ fontSize: 56 }}>👩🏽</Emoji>
                      <Mono className={styles.sigThumbTag}>9:16 · Video</Mono>
                      <Emoji className={styles.sigThumbEmoji}>🎬</Emoji>
                    </div>
                    <div className={styles.sigScoreCol}>
                      <span className={styles.disp}>82</span>
                      <Mono>Best practice</Mono>
                    </div>
                  </div>
                  <div className={styles.sigTopRow}>
                    <Emoji className={styles.sigTopThumb}>👩🏽</Emoji>
                    <div className={styles.sigTopMeta}>
                      <Mono>Checklist · Meta</Mono>
                      <span className={styles.disp}>82</span>
                      <Mono>Best practice</Mono>
                    </div>
                  </div>
                  <div className={styles.sigList}>
                    <div className={styles.sigListHead}>
                      <Mono>Checklist · Meta</Mono>
                      <Emoji style={{ fontSize: 16 }}>📋</Emoji>
                    </div>
                    {CHECKLIST.map((c) => (
                      <div key={c.label} className={cx(styles.checkRow, c.hot && styles.checkRowHot)}>
                        <Emoji>{c.emoji}</Emoji>
                        <span>{c.label}</span>
                        <Mono>{c.verdict}</Mono>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.pillRow}>
                  {PILLS_SIGNAL.map((p) => (
                    <Mono key={p} className={styles.pillTag}>
                      {p}
                    </Mono>
                  ))}
                </div>
                <div className={styles.pcardFoot}>
                  <Mono className={styles.pcardHost}>signal.creos-labs.com</Mono>
                  <TryLink product="signal">Try Signal →</TryLink>
                </div>
              </article>

              {/* OUTLIER */}
              <article className={styles.pcard}>
                <div className={styles.pcardTop}>
                  <div className={styles.pcardTitleBox}>
                    <Mono className={styles.pcardKicker}>02 · Competitive content intelligence</Mono>
                    <h3 className={cx(styles.disp, styles.pcardTitle)}>Outlier</h3>
                  </div>
                  <Emoji className={styles.pcardEmoji}>🔭</Emoji>
                </div>
                <p className={styles.pcardDesc}>
                  Watch the creators you care about and catch the posts that break out <span>— transcribed and ready to learn from.</span>
                </p>

                <div className={cx(styles.preview, styles.watch)}>
                  <div className={styles.watchHead}>
                    <Mono>
                      Watchlist · vs<span className={styles.deskOnly}> creator</span> median
                    </Mono>
                    <Mono className={styles.watchBadge}>1 outlier</Mono>
                  </div>
                  {WATCHLIST.map((w) => (
                    <div key={w.handle} className={cx(styles.watchRow, w.hot && styles.watchRowHot)}>
                      <div className={styles.watchLine}>
                        <Avatar>{w.who}</Avatar>
                        <div className={styles.watchText}>
                          <span>{w.handle}</span>
                          <span>{w.quote}</span>
                        </div>
                        <span className={cx(styles.disp, styles.watchMult, w.hot && styles.watchMultHot)}>{w.mult}</span>
                      </div>
                      <div className={styles.meter} aria-hidden="true">
                        <div className={cx(styles.meterFill, w.hot && styles.meterFillHot)} style={{ width: `${w.fill}%` }} />
                        <div className={styles.meterMark} style={{ left: "15%" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.pillRow}>
                  {PILLS_OUTLIER.map((p) => (
                    <Mono key={p} className={styles.pillTag}>
                      {p}
                    </Mono>
                  ))}
                </div>
                <div className={styles.pcardFoot}>
                  <Mono className={styles.pcardHost}>outlier.creos-labs.com</Mono>
                  <TryLink product="outlier">Try Outlier →</TryLink>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="services" className={cx(styles.services, styles.secLight)}>
          <div className={styles.wrap}>
            <div className={styles.servicesHead}>
              <Eyebrow tone="light">03. Services</Eyebrow>
              <h2 className={cx(styles.disp, styles.h2Services)}>
                Need something built
                <br className={styles.deskOnly} /> for you?
              </h2>
              <p>Pick a scoped build from the menu, or tell us the problem and we’ll design the tool around it.</p>
            </div>
            <div className={styles.serviceGrid}>
              <div className={styles.service}>
                <div className={styles.serviceThumb} aria-hidden="true">
                  <Mono className={styles.csvChip}>CSV</Mono>
                  <span className={styles.plus} style={{ color: "var(--label-l)" }}>
                    →
                  </span>
                  <div className={styles.miniBars}>
                    {[30, 50, 40, 100, 60].map((h, i) => (
                      <div key={i} className={i === 3 ? styles.miniBarHot : undefined} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <h3 className={styles.disp}>Reporting pipeline</h3>
                <p>Platform exports in, a clean weekly read-out of what worked out.</p>
                <Price value={SERVICE_PRICES.reporting} />
              </div>

              <div className={styles.service}>
                <div className={cx(styles.serviceThumb)} style={{ justifyContent: "space-between" }} aria-hidden="true">
                  <div className={styles.trio}>
                    <Avatar>👩🏻</Avatar>
                    <Avatar>🧔🏾</Avatar>
                    <Avatar>👩🏼‍🦰</Avatar>
                  </div>
                  <Mono className={styles.medianPill}>6.2× median</Mono>
                </div>
                <h3 className={styles.disp}>Creator tracking</h3>
                <p>Follow the creators that matter to you and surface the content that breaks out.</p>
                <Price value={SERVICE_PRICES.tracking} />
              </div>

              <div className={styles.service}>
                <div className={styles.serviceThumb} style={{ alignItems: "flex-start" }} aria-hidden="true">
                  <div className={styles.agentTile}>
                    <Asterisk size={18} />
                  </div>
                  <div className={styles.agentBody}>
                    <span>
                      Trend agent <span>· 9:02am</span>
                    </span>
                    <span>3 threads worth a look today</span>
                    <div className={styles.reacts}>
                      <Emoji>👀 2</Emoji>
                      <Emoji>🔥 1</Emoji>
                    </div>
                  </div>
                </div>
                <h3 className={styles.disp}>Marketing agents</h3>
                <p>Automations that watch news, trends and communities and post the useful bits to Slack.</p>
                <Price value={SERVICE_PRICES.agents} />
              </div>

              <a id="enquire" href={ENQUIRE_HREF} className={cx(styles.service, styles.serviceCustom)}>
                <div className={styles.serviceThumb} aria-hidden="true">
                  <Emoji style={{ fontSize: 26 }}>🧑🏽‍💻</Emoji>
                  <span className={styles.plus}>+</span>
                  <Asterisk size={34} />
                  <span className={styles.plus}>=</span>
                  <Mono className={styles.toolPill}>Your tool</Mono>
                </div>
                <span className={cx(styles.disp, styles.customTitle)}>Custom build</span>
                <p>Something that doesn’t exist yet. Scoped with you, built to fit.</p>
                <span className={styles.customCta}>Enquire →</span>
              </a>
            </div>
          </div>
        </section>

        <section className={cx(styles.wrap, styles.closeHome)}>
          <div className={styles.closeAvatars} aria-hidden="true">
            <Avatar>👩🏻</Avatar>
            <Avatar>🧔🏾</Avatar>
            <Avatar className={styles.avatarHot}>🤝</Avatar>
            <Avatar>👩🏼‍🦰</Avatar>
            <Avatar>👨🏻‍🦱</Avatar>
          </div>
          <h2 className={cx(styles.disp, styles.h2Close)}>
            Got a marketing problem software should solve<Accent>?</Accent>
          </h2>
          <a href={ENQUIRE_HREF} className={styles.closeBtn}>
            Start a project
          </a>
        </section>
      </main>
      <SiteFooter variant="home" />
    </div>
  );
}
