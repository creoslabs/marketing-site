import Image from "next/image";
import type { CSSProperties } from "react";

// Approved Creos Labs logo assets (public/brand/creos, from the brand pack).
// The mark and lockup are fixed artwork — never recreate them in CSS or text.
const BASE = "/brand/creos";
const LOCKUP_RATIO = 1049.3 / 146; // symbol-left lockup viewBox
const MARK_VIEWBOX = 112;

// The split-asterisk symbol. `light` is for light/white backgrounds (all black).
export function BrandMark({ size = 24, light = false, className }: { size?: number; light?: boolean; className?: string }) {
  return (
    <Image
      src={`${BASE}/creos-labs-mark-${light ? "on-light" : "on-dark"}.svg`}
      alt=""
      width={MARK_VIEWBOX}
      height={MARK_VIEWBOX}
      unoptimized
      className={className}
      style={{ width: size, height: size, flex: "none" }}
      aria-hidden="true"
    />
  );
}

// Lockup 1: symbol left, wordmark right. Sized by height (the prop, or a CSS class
// when it should change per breakpoint); width follows the artwork.
export function BrandLockup({
  height,
  light = false,
  className,
  style,
}: {
  height?: number;
  light?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Image
      src={`${BASE}/creos-labs-lockup-1-symbol-left-${light ? "on-light" : "on-dark"}.svg`}
      alt="Creos Labs"
      width={Math.round((height ?? 24) * LOCKUP_RATIO)}
      height={height ?? 24}
      unoptimized
      className={className}
      style={{ ...(height ? { height } : null), width: "auto", flex: "none", ...style }}
    />
  );
}

// Single-colour lockup that takes its colour from CSS — for themed surfaces
// (workspace light/dark) where one fixed-colour image can't be right for both.
export function BrandLockupMono({
  height = 18,
  color = "currentColor",
  className,
}: {
  height?: number;
  color?: string;
  className?: string;
}) {
  const url = `url(${BASE}/creos-labs-lockup-1-symbol-left-mono-black.svg)`;
  return (
    <span
      role="img"
      aria-label="Creos Labs"
      className={className}
      style={{
        display: "inline-block",
        flex: "none",
        height,
        width: Math.round(height * LOCKUP_RATIO),
        background: color,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
}
