import type { CSSProperties, ReactNode } from "react";
import styles from "./site.module.css";

export const ENQUIRE_HREF = "mailto:hello@creos-labs.com?subject=Custom%20build%20enquiry";
export const TEAMS_HREF = "mailto:hello@creos-labs.com?subject=Creos%20for%20teams";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// The approved split-asterisk: six arms, top three paper and bottom three
// accent. On any light or white background the whole mark is ink.
export function Asterisk({ size = 24, light = false, className }: { size?: number; light?: boolean; className?: string }) {
  const top = light ? "#0B0B0A" : "#F2F0EA";
  const bottom = light ? "#0B0B0A" : "#FFD60A";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={{ flex: "none" }}>
      <g strokeWidth="3.2" strokeLinecap="square">
        <path d="M12 12V2.5M12 12L3.8 7.2M12 12l8.2-4.8" stroke={top} />
        <path d="M12 12v9.5M12 12l-8.2 4.8M12 12l8.2 4.8" stroke={bottom} />
      </g>
    </svg>
  );
}

// "CREOS LABS®" — never "CREOS LABS*".
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx(styles.disp, className)}>
      CREOS LABS<sup>®</sup>
    </span>
  );
}

export function Emoji({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={cx(styles.emo, className)} style={style} aria-hidden="true">
      {children}
    </span>
  );
}

// People emoji sit in paper circles. Pass `size` for a fixed diameter, or omit
// it and let a parent class set --s so the size can change per breakpoint.
export function Avatar({
  children,
  size,
  className,
  style,
}: {
  children: ReactNode;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cx(styles.avatar, className)}
      style={size ? ({ "--s": `${size}px`, ...style } as CSSProperties) : style}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function AvatarStack({ people, size, className }: { people: string[]; size?: number; className?: string }) {
  return (
    <span
      className={cx(styles.avatarStack, className)}
      style={size ? ({ "--s": `${size}px` } as CSSProperties) : undefined}
      aria-hidden="true"
    >
      {people.map((p, i) => (
        <Avatar key={i}>{p}</Avatar>
      ))}
    </span>
  );
}

export function Mono({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={cx(styles.mono, className)} style={style}>
      {children}
    </span>
  );
}

export function Accent({ children }: { children: ReactNode }) {
  return <span className={styles.accent}>{children}</span>;
}

// Muted second half of a headline on light sections.
export function Grey({ children }: { children: ReactNode }) {
  return <span className={styles.dim}>{children}</span>;
}

export function Eyebrow({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "dim" | "light" }) {
  const toneClass = tone === "accent" ? styles.eyebrow : tone === "dim" ? styles.eyebrowDim : styles.eyebrowL;
  return <div className={cx(styles.mono, toneClass)}>{children}</div>;
}

export function PillLinks({ links }: { links: Array<{ href: string; label: string }> }) {
  return (
    <div className={styles.pillLinkRow}>
      {links.map((l) => (
        <a key={l.href} href={l.href} className={cx(styles.mono, styles.pillLink)}>
          {l.label} ↗
        </a>
      ))}
    </div>
  );
}

export function ProductBadge({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className={cx(styles.mono, styles.badge)}>
      <Emoji style={{ fontSize: 14 }}>{emoji}</Emoji>
      {children}
      <span className={styles.liveDot} aria-hidden="true" />
      Live, early access
    </div>
  );
}
