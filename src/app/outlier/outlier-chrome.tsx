"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JOBS } from "./data";

const TABS = [
  { href: "/outlier", label: "Home" },
  { href: "/outlier/feed", label: "Feed" },
  { href: "/outlier/trends", label: "Trends" },
  { href: "/outlier/creators", label: "Creators" },
  { href: "/outlier/progress", label: "Progress" },
];

export function OutlierChrome() {
  const pathname = usePathname();
  const runningCount = JOBS.filter((job) => job.state === "running").length;

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

      <nav className="flex items-center gap-[4px]">
        {TABS.map((tab) => {
          const active = tab.href === "/outlier" ? pathname === "/outlier" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center gap-[6px] rounded-[7px] text-[13px] font-medium"
              style={{
                padding: "7px 10px",
                background: active ? "var(--ws-ink)" : "transparent",
                color: active ? "var(--ws-ground)" : "var(--ws-ink-60)",
              }}
            >
              {tab.label}
              {tab.label === "Progress" && runningCount > 0 && (
                <span
                  className="ws-tabular flex h-[16px] min-w-[16px] items-center justify-center rounded-full text-[10px] font-semibold"
                  style={{
                    background: active ? "var(--ws-ground)" : "var(--ws-accent)",
                    color: active ? "var(--ws-ink)" : "var(--ws-accent-ink)",
                    padding: "0 4px",
                  }}
                >
                  {runningCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
        pulled 12m ago
      </span>

      <div
        className="flex items-center gap-[4px] rounded-[7px] text-[12px]"
        style={{ padding: "5px 8px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-45)" }}
      >
        ⌘K
      </div>
    </header>
  );
}
