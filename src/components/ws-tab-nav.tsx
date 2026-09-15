"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type WsTab = {
  href: string;
  label: string;
  exact?: boolean;
  badge?: (active: boolean) => React.ReactNode;
};

function isTabActive(tab: WsTab, pathname: string) {
  return tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

// A tab list with a sliding indicator that animates position/width between
// the active tab instead of snapping — measured off the real DOM so it stays
// correct regardless of label length. "pill" gives a filled background block
// (Outlier); "underline" gives a 2px accent bar under the row (Workspace).
export function WsTabNav({ tabs, variant }: { tabs: WsTab[]; variant: "pill" | "underline" }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const activeTab = tabs.find((tab) => isTabActive(tab, pathname));
    const el = activeTab ? tabRefs.current[activeTab.href] : null;
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({ left: elRect.left - containerRect.left, width: elRect.width });
    }
  }, [pathname, tabs]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      style={{ gap: variant === "pill" ? 4 : 26, height: variant === "underline" ? "100%" : undefined }}
    >
      {indicator && (
        <div
          className="ws-tab-indicator"
          style={
            variant === "pill"
              ? {
                  top: 7,
                  height: 28,
                  left: indicator.left,
                  width: indicator.width,
                  background: "var(--ws-ink)",
                  borderRadius: 7,
                  zIndex: 0,
                }
              : {
                  bottom: -1,
                  height: 2,
                  left: indicator.left,
                  width: indicator.width,
                  background: "var(--ws-accent)",
                  zIndex: 0,
                }
          }
        />
      )}
      {tabs.map((tab) => {
        const active = isTabActive(tab, pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            ref={(el) => {
              tabRefs.current[tab.href] = el;
            }}
            className="relative flex items-center text-[12.5px] transition-colors duration-150"
            style={
              variant === "pill"
                ? {
                    gap: 6,
                    padding: "7px 10px",
                    borderRadius: 7,
                    fontWeight: 500,
                    color: active ? "var(--ws-ground)" : "var(--ws-ink-60)",
                    zIndex: 1,
                  }
                : {
                    height: "100%",
                    gap: 6,
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--ws-ink)" : "var(--ws-ink-60)",
                    zIndex: 1,
                  }
            }
          >
            {tab.label}
            {tab.badge?.(active)}
          </Link>
        );
      })}
    </div>
  );
}
