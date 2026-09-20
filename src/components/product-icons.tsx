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

// Outlier: a tight cluster of ordinary points, plus one point that's broken
// away from the group — the statistical-outlier concept, literally.
export function OutlierMark({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="8" cy="15" r="1.6" fill="currentColor" opacity="0.35" />
      <circle cx="12.5" cy="16.5" r="1.6" fill="currentColor" opacity="0.35" />
      <circle cx="10" cy="18.5" r="1.6" fill="currentColor" opacity="0.35" />
      <circle cx="14" cy="13" r="1.6" fill="currentColor" opacity="0.35" />
      <path d="M12 14 L18.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="1.5 2" opacity="0.4" />
      <circle cx="19" cy="6" r="2.6" fill="currentColor" />
    </svg>
  );
}

// Signal: a simple ascending bar read — the "score" concept, not a generic
// analytics chart (deliberately just four bars, no axes/labels).
export function SignalMark({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="14" width="3.2" height="6" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="9.4" y="10" width="3.2" height="10" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="14.8" y="12" width="3.2" height="8" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="19" y="6" width="3.2" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}
