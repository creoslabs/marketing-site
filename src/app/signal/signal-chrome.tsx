"use client";

import Link from "next/link";
import { useWsTheme } from "@/components/ws-theme";
import { WsTabNav, type WsTab } from "@/components/ws-tab-nav";

const TABS: WsTab[] = [
  { href: "/signal/analyze", label: "Analyze" },
  { href: "/signal", label: "Library", exact: true },
  { href: "/signal/benchmarks", label: "Benchmarks" },
];

export function SignalChrome() {
  useWsTheme();

  return (
    <header
      className="flex items-center gap-[22px] px-6"
      style={{ height: 58, borderBottom: "1px solid var(--ws-hairline)" }}
    >
      <div className="flex items-center gap-[8px]">
        <Link href="/workspace" className="text-[13px]" style={{ color: "var(--ws-ink-45)" }}>
          Creos Labs
        </Link>
        <span style={{ color: "var(--ws-ink-45)" }}>/</span>
        <Link
          href="/signal"
          className="text-[17px] font-bold tracking-[-0.02em]"
          style={{ color: "var(--ws-ink)" }}
        >
          Signal
        </Link>
      </div>

      <WsTabNav tabs={TABS} variant="underline" />

      <div className="flex-1" />

      <div
        className="flex items-center gap-[4px] rounded-[7px] text-[12px] transition-transform active:scale-95"
        style={{ padding: "5px 8px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-45)" }}
      >
        ⌘K
      </div>
    </header>
  );
}
