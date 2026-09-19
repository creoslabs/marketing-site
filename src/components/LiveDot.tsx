import { cn } from "@/lib/utils";

export function LiveDot({ className }: { className?: string }) {
  return <span className={cn("live-dot text-accent-blue", className)} aria-hidden />;
}
