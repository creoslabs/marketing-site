import type { CSSProperties } from "react";

// Line icons used across the app chrome and buttons. 24px grid, 2px round
// stroke, drawn in currentColor so they follow the surrounding text.
const PATHS = {
  plus: "M12 5v14M5 12h14",
  refresh: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5",
  upload: "M12 19V5M6 11l6-6 6 6",
  download: "M12 5v11M7 11l5 5 5-5M5 20h14",
  chevronDown: "M7 10l5 5 5-5",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  play: "M8 5l11 7-11 7z",
  pause: "M8 5v14M16 5v14",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  external: "M7 17L17 7M8 7h9v9",
  check: "M5 12l5 5 9-10",
  search: "M20 20l-4.5-4.5",
} as const;

export type IconName = keyof typeof PATHS | "bell" | "searchGlass";

export function Icon({ name, size = 15, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none", ...style }}
    >
      {name === "bell" ? (
        <>
          <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </>
      ) : name === "searchGlass" ? (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d={PATHS.search} />
        </>
      ) : (
        <path d={PATHS[name]} />
      )}
    </svg>
  );
}
