"use client";

import Link from "next/link";
import { useWsTheme } from "@/components/ws-theme";
import { useCommandPalette } from "@/components/ws-command-palette";
import { NotificationBell } from "@/components/notification-bell";
import { WsTabNav, type WsTab } from "@/components/ws-tab-nav";

export function OutlierChrome({
  runningCount,
  lastPulledLabel,
}: {
  runningCount: number;
  lastPulledLabel: string | null;
}) {
  useWsTheme();
  const openPalette = useCommandPalette();

  const TABS: WsTab[] = [
    { href: "/outlier", label: "Home", exact: true },
    { href: "/outlier/feed", label: "Feed" },
    { href: "/outlier/favourites", label: "Favourites" },
    { href: "/outlier/creators", label: "Creators" },
    {
      href: "/outlier/progress",
      label: "Progress",
      badge:
        runningCount > 0
          ? () => (
              <span
                className="ws-tabular ws-badge-pulse flex h-[16px] min-w-[16px] items-center justify-center rounded-full text-[10px] font-semibold"
                style={{
                  background: "var(--ws-accent)",
                  color: "var(--ws-accent-ink)",
                  padding: "0 4px",
                }}
              >
                {runningCount}
              </span>
            )
          : undefined,
    },
  ];

  return (
    <header
      className="flex items-center gap-[22px] px-6"
      style={{ height: 56, borderBottom: "1px solid var(--ws-hairline)" }}
    >
      <div className="flex items-center gap-[8px]">
        <Link href="/workspace" className="text-[13px]" style={{ color: "var(--ws-ink-45)" }}>
          Creos Labs
        </Link>
        <span style={{ color: "var(--ws-ink-45)" }}>/</span>
        <Link
          href="/outlier"
          className="text-[17px] font-bold tracking-[-0.02em]"
          style={{ color: "var(--ws-ink)" }}
        >
          Outlier
        </Link>
      </div>

      <WsTabNav tabs={TABS} variant="underline" />

      <div className="flex-1" />

      {lastPulledLabel && (
        <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
          pulled {lastPulledLabel}
        </span>
      )}

      <NotificationBell />

      <button
        type="button"
        onClick={openPalette}
        className="flex items-center gap-[4px] rounded-[7px] text-[12px] transition-transform active:scale-95"
        style={{ padding: "5px 8px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-45)" }}
      >
        ⌘K
      </button>
    </header>
  );
}
