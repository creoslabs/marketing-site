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

      <div className="ws-stack-row hidden sm:flex" style={{ height: 34, borderRadius: 8 }}>
        {lastPulledLabel && (
          <span className="flex items-center text-[13px]" style={{ padding: "0 14px", color: "var(--ws-ink-45)" }}>
            Pulled {lastPulledLabel}
          </span>
        )}

        <NotificationBell bare />

        <button
          type="button"
          onClick={openPalette}
          className="flex items-center text-[13px] transition-transform active:scale-95"
          style={{ padding: "0 14px", color: "var(--ws-ink-45)" }}
        >
          ⌘K
        </button>
      </div>

      <WsAvatarMenu name={name} email={email} initials={initials} />
    </header>
  );
}
