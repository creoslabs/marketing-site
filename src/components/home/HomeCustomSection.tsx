"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const LINES = ["Sometimes", "the tool you need", "doesn’t exist.", "So we build it."];

const CAPABILITIES = [
  { title: "Data integrations", body: "Ad platforms, CRMs and analytics joined into one source your team trusts." },
  { title: "Custom platforms", body: "Internal tools shaped around how your team or agency actually works." },
  { title: "Automation workflows", body: "Reporting, briefs and busywork done without anyone copying and pasting." },
  { title: "Strategy and consulting", body: "Work out what to build, and what not to, before a line of code." },
];

export function HomeCustomSection() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={`${styles.deep} ${styles.custom}`} id="custom">
      <div className={styles.wrap}>
        <span className={styles.label}>Creos / Custom</span>
        <h2 ref={ref} className={`${styles.mega} ${inView ? styles.megaIn : ""}`}>
          {LINES.map((line, i) => (
            <span key={line} className={`${styles.ln} ${i === LINES.length - 1 ? styles.lnAccent : ""}`}>
              <span>{line}</span>
            </span>
          ))}
        </h2>

        <div className={styles.caps}>
          {CAPABILITIES.map((c) => (
            <div key={c.title}>
              <b>{c.title}</b>
              <p>{c.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <p>Tell us what your team keeps doing by hand. We&rsquo;ll scope the tool that does it for you.</p>
          <a className={styles.btn} href="mailto:hello@creos-labs.com?subject=Custom%20build">
            Talk to us about a build
          </a>
        </div>
      </div>
    </section>
  );
}
