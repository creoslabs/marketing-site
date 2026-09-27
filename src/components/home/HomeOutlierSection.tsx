"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import styles from "./home.module.css";

const N = 29;
const W = 1200;
const H = 280;
const MAX = 13.2;
const MED = 0.31;

// A simulated view-count growth curve for one example breakout post — the
// same illustrative-demo pattern as the product page's filmstrip screenshots,
// not a claim about any real post or Creos Labs' own data.
function viewsAt(i: number) {
  const t = i * 0.25;
  return 12.8 / (1 + Math.exp(-(t - 4.43) * 1.45)) + 0.012 * t;
}
function yFor(val: number) {
  return H - 8 - (val / MAX) * (H - 24);
}
function xFor(i: number) {
  return (i / (N - 1)) * W;
}
function fmt(n: number) {
  return n >= 1 ? `${n.toFixed(1)}M` : `${Math.round(n * 1000)}K`;
}

export function HomeOutlierSection() {
  const [i, setI] = useState(28);
  const chartRef = useRef<HTMLDivElement>(null);

  const { linePath, areaPath, baseY } = useMemo(() => {
    let d = "";
    for (let k = 0; k < N; k++) {
      d += (k ? "L" : "M") + xFor(k).toFixed(1) + " " + yFor(viewsAt(k)).toFixed(1);
    }
    return { linePath: d, areaPath: `${d}L${W} ${H}L0 ${H}Z`, baseY: yFor(MED) };
  }, []);

  const val = viewsAt(i);
  const score = val / MED;
  const scoreLabel = `${score < 10 ? score.toFixed(1) : Math.round(score)}×`;
  const last24h = val - viewsAt(Math.max(0, i - 4));
  const dotLeftPct = (i / (N - 1)) * 100;
  const dotTopPct = (yFor(val) / H) * 100;
  const baseTopPct = (baseY / H) * 100;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = Math.round(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * (N - 1));
    setI(next);
  }

  return (
    <section className={`${styles.deep} ${styles.sec}`} id="outlier">
      <div className={`${styles.wrap} ${styles.secHead}`}>
        <span className={styles.label}>
          Outlier <span className={styles.status}>Live, early access</span>
        </span>
        <h2 className={styles.display}>
          <span>Your competitors</span>
          <span>are telling you</span>
          <span>what works.</span>
        </h2>
        <div className={styles.intro}>
          <p>
            Track the creators and brands in your space. Every post is scored against its own running median, so you
            see what&rsquo;s breaking out while it&rsquo;s still climbing.
          </p>
          <a href="/products/outlier">
            Explore Outlier <span className={styles.arrow}>↗</span>
          </a>
        </div>
      </div>

      <div className={styles.bleedR}>
        <div className={styles.oPanel}>
          <div className={styles.oTop}>
            <div className={styles.post}>
              <div className={styles.thumb} aria-hidden="true" />
              <div>
                <b>Competitor reel</b>
                <small>Instagram, posted 7 days ago</small>
                <br />
                <span className={styles.tag}>Breakout</span>
              </div>
            </div>
            <div className={styles.reads} aria-live="polite">
              <div className={styles.read}>
                <small>Views</small>
                <b>{fmt(val)}</b>
              </div>
              <div className={styles.read}>
                <small>Running median</small>
                <b>310K</b>
              </div>
              <div className={styles.read}>
                <small>Score</small>
                <b>{scoreLabel}</b>
              </div>
              <div className={styles.read}>
                <small>Last 24 hours</small>
                <b>+{fmt(last24h)}</b>
              </div>
            </div>
          </div>

          <div className={styles.chart} ref={chartRef} onPointerMove={handlePointerMove}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="outlierAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ECEBE7" stopOpacity=".16" />
                  <stop offset="1" stopColor="#ECEBE7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#outlierAreaGradient)" />
              <line x1={0} x2={W} y1={baseY} y2={baseY} stroke="#8C8B86" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
              <path d={linePath} fill="none" stroke="#ECEBE7" strokeWidth={2} vectorEffect="non-scaling-stroke" />
              <line x1={xFor(i)} x2={xFor(i)} y1={0} y2={H} stroke="rgba(236,235,231,.35)" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className={styles.baseL} style={{ top: `${baseTopPct}%` }}>
              Their running median
            </span>
            <span className={styles.dot} style={{ left: `${dotLeftPct}%`, top: `${dotTopPct}%` }} />
          </div>
          <div className={styles.axis} aria-hidden="true">
            <span>Posted</span>
            <span>Day 1</span>
            <span>Day 2</span>
            <span>Day 3</span>
            <span>Day 4</span>
            <span>Day 5</span>
            <span>Day 6</span>
            <span>Day 7</span>
          </div>
          <div className={styles.scrub}>
            <input
              type="range"
              min={0}
              max={N - 1}
              value={i}
              onChange={(e) => setI(+e.target.value)}
              aria-label="Hours after posting"
              className={styles.range}
            />
            <output>{i * 6} h after posting</output>
          </div>

          <div className={styles.why}>
            <div>
              <small>Hook style</small>
              <p>Pattern interrupt</p>
            </div>
            <div>
              <small>Beats</small>
              <div className={styles.beats}>
                <span style={{ flex: 2 }}>Hook 0–2 s</span>
                <span style={{ flex: 4 }}>Reveal 2–6 s</span>
                <span style={{ flex: 5 }}>Payoff 6–11 s</span>
              </div>
            </div>
            <div>
              <small>Opening line, auto-transcribed</small>
              <p>&ldquo;Nobody tells you this before you launch a skincare brand.&rdquo;</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
