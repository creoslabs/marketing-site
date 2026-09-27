"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

type CheckState = "pass" | "partial" | "fail";
type Check = [CheckState, string, string];
type Segment = { name: string; start: number; end: number; caption: string; checks: Check[] };

// An illustrative example scored ad — the same kind of demo content as the
// product page's own screenshots, not a real advertiser's creative.
const SEGMENTS: Segment[] = [
  {
    name: "Problem",
    start: 0,
    end: 3,
    caption: "Dry skin by 3pm?",
    checks: [
      ["pass", "Hook lands in the first 1.5 s", "Lands at 1.2 s"],
      ["pass", "Pain named on screen", "Text overlay in frame one"],
      ["partial", "Face or product in the first frame", "Face enters at 0.8 s"],
    ],
  },
  {
    name: "Demonstration",
    start: 3,
    end: 9,
    caption: "One pump. Watch it sink in.",
    checks: [
      ["pass", "Product shown in use", "Absorption shot at 4.5 s"],
      ["pass", "Benefit clear without sound", "Caption carries the claim"],
      ["partial", "Cuts every 2 s or faster", "Averages 2.6 s"],
    ],
  },
  {
    name: "Proof",
    start: 9,
    end: 15,
    caption: "4,800 five-star reviews",
    checks: [
      ["pass", "Social proof on screen", "Review count and before/after"],
      ["fail", "One clear call to action", "Two offers compete in the last 3 s"],
      ["pass", "Brand in the final frame", "Logo holds for 1.4 s"],
    ],
  },
];

const CHECK_LABEL: Record<CheckState, string> = { pass: "Pass", partial: "Partial", fail: "Fail" };
const PAST_SCORES = [41, 48, 52, 55, 57, 58, 60, 61, 63, 64, 66, 67, 68, 69, 70, 71, 72, 73, 74, 76, 78, 79, 85, 88];
const MY_SCORE = 82;

// The interactive segment-breakdown demo, shared between the homepage's
// Signal section and Signal's own dedicated product page.
export function SignalDemoPanel() {
  const [activeSeg, setActiveSeg] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const t0 = performance.now() - time * 500;
    const tick = (now: number) => {
      const t = Math.min(15, (now - t0) / 500);
      const idx = SEGMENTS.findIndex((s) => t < s.end);
      setActiveSeg(idx < 0 ? 2 : idx);
      setTime(t);
      if (t < 15) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // Only restart the loop from a fresh play toggle, not on every time update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  function selectSegment(idx: number) {
    setPlaying(false);
    setActiveSeg(idx);
    setTime(SEGMENTS[idx].start);
  }

  const seg = SEGMENTS[activeSeg];
  const timecode = `0:${String(Math.floor(time)).padStart(2, "0")}`;
  const frameClass = [styles.frameSeg0, styles.frameSeg1, styles.frameSeg2][activeSeg];

  return (
    <div className={styles.bleedL}>
      <div className={styles.sPanel}>
        <div className={`${styles.frame} ${frameClass}`}>
          <span className={styles.tc}>{timecode}</span>
          <p className={styles.cap}>{seg.caption}</p>
          <button
            type="button"
            className={styles.play}
            onClick={() => {
              if (playing) {
                setPlaying(false);
              } else {
                if (time >= 15) setTime(0);
                setPlaying(true);
              }
            }}
          >
            {playing ? "Pause" : "Play breakdown"}
          </button>
        </div>

        <div>
          <div className={styles.adH}>
            <div>
              <h3>Hydration serum, 15 s vertical</h3>
              <p>Scored against 9:16 video criteria, before launch</p>
            </div>
            <div className={styles.score}>
              <b>82</b>
              <span>/100</span>
            </div>
          </div>

          <div className={styles.bench}>
            <small>Against your 24 other 9:16 assets</small>
            <div className={styles.dist}>
              {PAST_SCORES.map((s, idx) => (
                <i key={idx} className={styles.distTick} style={{ left: `${((s - 35) / 60) * 100}%`, height: 14 }} />
              ))}
              <i className={`${styles.distTick} ${styles.distMe}`} style={{ left: `${((MY_SCORE - 35) / 60) * 100}%`, height: 34 }} />
              <em className={styles.distLabel} style={{ left: `${((MY_SCORE - 35) / 60) * 100}%` }}>
                This ad, top 10%
              </em>
            </div>
          </div>

          <div className={styles.segs} role="group" aria-label="Ad beats">
            {SEGMENTS.map((s, idx) => (
              <button
                key={s.name}
                type="button"
                style={{ flex: s.end - s.start }}
                aria-pressed={idx === activeSeg}
                onClick={() => selectSegment(idx)}
              >
                {s.name}
                <small>
                  {s.start}–{s.end} s
                </small>
              </button>
            ))}
          </div>
          <div className={styles.track}>
            <span className={styles.head} style={{ left: `${(time / 15) * 100}%` }} />
          </div>

          <ul className={styles.checks} aria-live="polite">
            {seg.checks.map(([state, criterion, note]) => (
              <li key={criterion}>
                <span className={styles.checkSt}>
                  <span className={`${styles.mk} ${state === "pass" ? styles.mkPass : state === "partial" ? styles.mkPartial : ""}`} aria-hidden="true" />
                  {CHECK_LABEL[state]}
                </span>
                <span>{criterion}</span>
                <span className={styles.checkNote}>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
