"use client";

import { useWsTheme } from "@/components/ws-theme";
import { useCommandPalette } from "@/components/ws-command-palette";
import { NotificationBell } from "@/components/notification-bell";
import { WsTabNav, type WsTab } from "@/components/ws-tab-nav";
import { ProductSwitcher } from "@/components/product-switcher";

const TABS: WsTab[] = [
  { href: "/signal/analyze", label: "Analyze" },
  { href: "/signal", label: "Library", exact: true },
  { href: "/signal/benchmarks", label: "Benchmarks" },
];

export function SignalChrome() {
  useWsTheme();
  const openPalette = useCommandPalette();

  return (
    <>
      <header
        className="flex items-center gap-[10px] px-4 sm:gap-[22px] sm:px-6"
        style={{ height: 58, borderBottom: "1px solid var(--ws-hairline)" }}
      >
        <ProductSwitcher current="signal" />

        <div className="flex-1" />

        <NotificationBell />

        <button
          type="button"
          onClick={openPalette}
          className="hidden items-center gap-[4px] rounded-[7px] text-[12px] transition-transform active:scale-95 sm:flex"
          style={{ padding: "5px 8px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-45)" }}
        >
          ⌘K
        </button>
      </header>

      <nav className="overflow-x-auto px-4 sm:px-6" style={{ height: 44, borderBottom: "1px solid var(--ws-hairline)" }}>
        <WsTabNav tabs={TABS} variant="underline" />
      </nav>
    </>
  );
}
