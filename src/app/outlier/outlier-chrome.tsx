"use client";

import Link from "next/link";
import { useWsTheme } from "@/components/ws-theme";
import { WsTabNav, type WsTab } from "@/components/ws-tab-nav";
import { JOBS } from "./data";

export function OutlierChrome() {
  useWsTheme();
  const runningCount = JOBS.filter((job) => job.state === "running").length;

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
          ? (active) => (
              <span
                className="ws-tabular ws-badge-pulse flex h-[16px] min-w-[16px] items-center justify-center rounded-full text-[10px] font-semibold"
                style={{
                  background: active ? "var(--ws-ground)" : "var(--ws-accent)",
                  color: active ? "var(--ws-ink)" : "var(--ws-accent-ink)",
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

      <WsTabNav tabs={TABS} variant="pill" />

      <div className="flex-1" />

      <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
        pulled 12m ago
      </span>

      <div
        className="flex items-center gap-[4px] rounded-[7px] text-[12px] transition-transform active:scale-95"
        style={{ padding: "5px 8px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-45)" }}
      >
        ⌘K
      </div>
    </header>
  );
}
