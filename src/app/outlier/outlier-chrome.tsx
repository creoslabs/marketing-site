"use client";

import { useWsTheme } from "@/components/ws-theme";
import { useCommandPalette } from "@/components/ws-command-palette";
import { NotificationBell } from "@/components/notification-bell";
import { WsTabNav, type WsTab } from "@/components/ws-tab-nav";
import { WsAvatarMenu } from "@/components/ws-avatar-menu";
import { ProductSwitcher } from "@/components/product-switcher";

const CHROME_HEIGHT = 58;

export function OutlierChrome({
  runningCount,
  lastPulledLabel,
  name,
  email,
  initials,
}: {
  runningCount: number;
  lastPulledLabel: string | null;
  name: string;
  email: string;
  initials: string;
}) {
  useWsTheme();
  const openPalette = useCommandPalette();

  const TABS: WsTab[] = [
    { href: "/outlier", label: "Home", exact: true },
    { href: "/outlier/feed", label: "Feed" },
    { href: "/outlier/trends", label: "Trends" },
    { href: "/outlier/creators", label: "Creators" },
    {
      href: "/outlier/progress",
      label: "Progress",
      badge:
        runningCount > 0
          ? () => (
              <span
                className="ws-tabular ws-badge-pulse flex h-[16px] min-w-[16px] items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ background: "var(--ws-accent)", color: "var(--ws-accent-ink)", padding: "0 4px" }}
              >
                {runningCount}
              </span>
            )
          : undefined,
    },
  ];

  return (
    <header
      className="flex items-center px-4 sm:px-[28px]"
      style={{ height: CHROME_HEIGHT, gap: 26, borderBottom: "1px solid var(--ws-hairline)" }}
    >
      <ProductSwitcher current="outlier" />

      <div className="hidden sm:block" style={{ height: CHROME_HEIGHT }}>
        <WsTabNav tabs={TABS} variant="underline" />
      </div>

      <div className="flex-1" />

      {lastPulledLabel && (
        <span className="hidden text-[13px] sm:inline" style={{ color: "var(--ws-ink-45)" }}>
          Pulled {lastPulledLabel}
        </span>
      )}

      <NotificationBell />

      <button
        type="button"
        onClick={openPalette}
        className="hidden items-center gap-[4px] rounded-[7px] text-[13px] transition-transform active:scale-95 sm:flex"
        style={{ padding: "5px 8px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-45)" }}
      >
        ⌘K
      </button>

      <WsAvatarMenu name={name} email={email} initials={initials} />
    </header>
  );
}
