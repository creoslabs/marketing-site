"use client";

import { useWsTheme } from "@/components/ws-theme";
import { useCommandPalette } from "@/components/ws-command-palette";
import { NotificationBell } from "@/components/notification-bell";
import { WsTabNav, type WsTab } from "@/components/ws-tab-nav";
import { WsAvatarMenu } from "@/components/ws-avatar-menu";
import { ProductSwitcher } from "@/components/product-switcher";

const CHROME_HEIGHT = 58;

const TABS: WsTab[] = [
  { href: "/signal/analyze", label: "Analyze" },
  { href: "/signal", label: "Library", exact: true },
  { href: "/signal/benchmarks", label: "Benchmarks" },
];

export function SignalChrome({ name, email, initials }: { name: string; email: string; initials: string }) {
  useWsTheme();
  const openPalette = useCommandPalette();

  return (
    <header
      className="flex items-center px-4 sm:px-[28px]"
      style={{ height: CHROME_HEIGHT, gap: 26, borderBottom: "1px solid var(--ws-hairline)" }}
    >
      <ProductSwitcher current="signal" />

      <div className="hidden sm:block" style={{ height: CHROME_HEIGHT }}>
        <WsTabNav tabs={TABS} variant="underline" />
      </div>

      <div className="flex-1" />

      <div className="ws-stack-row hidden sm:flex" style={{ height: 34, borderRadius: 8 }}>
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
