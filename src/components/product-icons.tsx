// Simple geometric product glyphs, deliberately not detailed illustrations —
// each reads clearly at 16–24px. Meant to be reused anywhere a product needs
// a compact identity: workspace cards, nav, activity rows, command palette,
// a future product switcher.

type IconProps = { size?: number; className?: string };

// The existing brand mark (src/app/icon.svg) as an inline component so it
// can sit inline with text at arbitrary sizes instead of only as a favicon.
export function CreosMark({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#000000" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="#f5f5f7" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="2" fill="#2997ff" />
    </svg>
  );
}

// Outlier: a baseline of ordinary points fading in, plus one point that's
// broken away above — the statistical-outlier concept, literally. The
// baseline dots and connecting dash use currentColor so they inherit
// whatever ink color the surrounding context already uses (nav text, a
// stat-card heading, etc.); only the outlier point itself carries the fixed
// brand accent (--outlier-accent — swaps to the on-dark tint automatically
// since it's set per .ws theme).
export function OutlierMark({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <circle cx="20" cy="84" r="9" fill="currentColor" opacity="0.3" />
      <circle cx="46" cy="90" r="9" fill="currentColor" opacity="0.65" />
      <circle cx="72" cy="86" r="9" fill="currentColor" />
      <line x1="92" y1="80" x2="92" y2="50" stroke="currentColor" strokeWidth="3" strokeDasharray="3 7" strokeLinecap="round" opacity="0.35" />
      <circle cx="92" cy="34" r="15" fill="var(--outlier-accent, #3b82f6)" />
    </svg>
  );
}

// Signal: broadcast arcs radiating from a source point — the "signal" being
// read, not a generic analytics chart. Reads fine on both light and dark
// grounds at the same fixed accent color, so unlike OutlierMark nothing
// here uses currentColor.
export function SignalMark({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <path d="M 37,76.7 A 30,30 0 0 1 83,76.7" stroke="var(--signal-accent, #8b5cf6)" strokeWidth="10" strokeLinecap="round" />
      <path d="M 24.8,66.4 A 46,46 0 0 1 95.2,66.4" stroke="var(--signal-accent, #8b5cf6)" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
      <path d="M 12.5,56.1 A 62,62 0 0 1 107.5,56.1" stroke="var(--signal-accent, #8b5cf6)" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
      <circle cx="60" cy="96" r="10" fill="var(--signal-accent, #8b5cf6)" />
    </svg>
  );
}
