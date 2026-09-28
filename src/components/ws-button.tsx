import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

// Design spec: "All buttons are exactly 40px tall, 8px radius, 12.5px."
// Primary = accent fill/white ink, weight 600. Ghost = 1px hairline, primary
// ink, weight 500. Danger = warn fill, weight 600.
const VARIANT_STYLE: Record<"primary" | "ghost" | "danger", React.CSSProperties> = {
  primary: { background: "var(--ws-accent)", color: "var(--ws-accent-ink)", fontWeight: 600 },
  ghost: { background: "transparent", color: "var(--ws-ink)", fontWeight: 500, border: "1px solid var(--ws-hairline)" },
  danger: { background: "var(--ws-warn)", color: "var(--ws-warn-ink)", fontWeight: 600 },
};

const BASE_STYLE: React.CSSProperties = {
  height: 40,
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "0 15px",
  borderRadius: 8,
  fontSize: 12.5,
  whiteSpace: "nowrap",
};

type Variant = "primary" | "ghost" | "danger";

export function WsButton({
  variant = "primary",
  href,
  style,
  children,
  ...props
}: {
  variant?: Variant;
  href?: string;
  style?: React.CSSProperties;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "style">) {
  const mergedStyle = { ...BASE_STYLE, ...VARIANT_STYLE[variant], ...style };

  if (href) {
    return (
      <Link href={href} style={mergedStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" style={mergedStyle} {...props}>
      {children}
    </button>
  );
}
