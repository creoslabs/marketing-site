import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/app/ui";

// Legacy name kept for existing call sites; renders the shared pill Button.
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
  return (
    <Button variant={variant} href={href} style={style} {...props}>
      {children}
    </Button>
  );
}
