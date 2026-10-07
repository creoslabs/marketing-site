import styles from "./site.module.css";
import { Asterisk, ENQUIRE_HREF, Emoji, Mono, Accent, cx } from "./ui";

type OrbitChip = { x: number; y: number; emoji: string; label: string; dark: boolean };

// Eight inputs pulling into the system. Positions are the handoff's, inside a
// fixed 560×520 stage with the hub at (280, 262).
const CHIPS: OrbitChip[] = [
  { x: 215, y: 52, emoji: "🎬", label: "9:16 ad", dark: true },
  { x: 418, y: 96, emoji: "🖼️", label: "Static ad", dark: false },
  { x: 455, y: 262, emoji: "🗂️", label: "Carousel", dark: true },
  { x: 400, y: 428, emoji: "📄", label: "Brand guidelines", dark: false },
  { x: 215, y: 478, emoji: "🧑🏽", label: "Creator reel", dark: true },
  { x: 100, y: 428, emoji: "📊", label: ".csv export", dark: false },
  { x: 92, y: 262, emoji: "🧵", label: "Reddit thread", dark: true },
  { x: 118, y: 96, emoji: "📈", label: "Trend report", dark: false },
];
const HUB = { x: 280, y: 262, r: 56 };

// Small-screen version: emoji dots only, on a 358×340 stage with the hub at (179, 170).
const DOTS: Array<{ x: number; y: number; emoji: string; dark: boolean }> = [
  { x: 179, y: 32, emoji: "🎬", dark: true },
  { x: 277, y: 72, emoji: "🖼️", dark: false },
  { x: 317, y: 170, emoji: "🗂️", dark: true },
  { x: 277, y: 268, emoji: "📄", dark: false },
  { x: 179, y: 308, emoji: "🧑🏽", dark: true },
  { x: 81, y: 268, emoji: "📊", dark: false },
  { x: 41, y: 170, emoji: "🧵", dark: true },
  { x: 81, y: 72, emoji: "📈", dark: false },
];
const DOT_HUB = { x: 179, y: 170, r: 42 };

// A 2px line from a node toward the hub, stopping at the hub's edge.
function spoke(x: number, y: number, hub: { x: number; y: number; r: number }) {
  const dx = hub.x - x;
  const dy = hub.y - y;
  return {
    left: x,
    top: y,
    width: Math.round(Math.hypot(dx, dy) - hub.r),
    transform: `rotate(${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1)}deg)`,
  };
}

export function HomeHero() {
  return (
    <section id="top" className={cx(styles.wrap, styles.heroHome)}>
      <div className={styles.heroCopy}>
        <div className={cx(styles.mono, styles.badgeHome)}>
          <Emoji style={{ fontSize: 15 }}>⚡</Emoji>New: Signal and Outlier are live
        </div>
        <h1 className={cx(styles.disp, styles.h1Home)}>
          Marketing,
          <br />
          <Accent>engineered.</Accent>
        </h1>
        <p className={styles.ledeHome}>
          Social media marketing tools and custom builds for teams, agencies and creators. Made by a marketer, for people who actually run
          campaigns.
        </p>
        <div className={styles.ctaRow}>
          <a href="#products" className={cx(styles.btn, styles.btnPaper)}>
            Explore products
          </a>
          <a href={ENQUIRE_HREF} className={cx(styles.btn, styles.btnOutline)}>
            Enquire about a custom build →
          </a>
        </div>
      </div>

      <div className={styles.heroVisual}>
        {/* Wide screens: the full orbit. */}
        <div className={styles.orbit} role="img" aria-label="Ads, reels, exports and threads all flowing into one system">
          <div className={styles.ringSolid} style={{ left: 60, top: 42, width: 440, height: 440 }} />
          <div className={styles.ringDash} style={{ left: 140, top: 122, width: 280, height: 280 }} />
          {CHIPS.map((c) => (
            <div key={c.label} className={styles.spoke} style={spoke(c.x, c.y, HUB)} />
          ))}
          <div className={styles.hub} style={{ left: 224, top: 206, width: 112, height: 112, boxShadow: "0 0 80px rgba(255,214,10,0.35)" }}>
            <Asterisk size={56} />
          </div>
          <Mono className={styles.orbitLabel} style={{ left: 230, top: 330, width: 100 }}>
            the system
          </Mono>
          {CHIPS.map((c) => (
            <div
              key={c.label}
              className={cx(styles.orbitChip, c.dark ? styles.chipDark : styles.chipPaper)}
              style={{ left: c.x, top: c.y }}
            >
              <Emoji style={{ fontSize: 18 }}>{c.emoji}</Emoji>
              <span>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Below ~640px: the constellation — emoji dots only, plus a caption. */}
        <div className={styles.constellation} role="img" aria-label="Ads, reels, exports and threads all flowing into one system">
          <div className={styles.constellationInner}>
            <div className={styles.ringSolid} style={{ left: 29, top: 20, width: 300, height: 300 }} />
            <div className={styles.ringDash} style={{ left: 79, top: 70, width: 200, height: 200 }} />
            {DOTS.map((d, i) => (
              <div key={i} className={styles.spoke} style={spoke(d.x, d.y, DOT_HUB)} />
            ))}
            <div className={styles.hub} style={{ left: 137, top: 128, width: 84, height: 84, boxShadow: "0 0 60px rgba(255,214,10,0.35)" }}>
              <Asterisk size={42} />
            </div>
            {DOTS.map((d, i) => (
              <Emoji
                key={i}
                className={cx(styles.dot, d.dark ? styles.dotDark : styles.dotPaper)}
                style={{ left: d.x - 24, top: d.y - 24 }}
              >
                {d.emoji}
              </Emoji>
            ))}
          </div>
        </div>
        <div className={cx(styles.mono, styles.constellationCaption)}>Ads, reels, exports, threads → one system</div>
      </div>
    </section>
  );
}
