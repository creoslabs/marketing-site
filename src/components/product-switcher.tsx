"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const PRODUCTS = [
  { key: "outlier", href: "/outlier", label: "Outlier" },
  { key: "signal", href: "/signal", label: "Signal" },
] as const;

export function ProductSwitcher({ current }: { current: "outlier" | "signal" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = PRODUCTS.find((p) => p.key === current)!;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="flex items-center gap-[8px]">
      <Link href="/workspace" className="hidden text-[13px] sm:inline" style={{ color: "var(--ws-ink-45)" }}>
        Creos Labs
      </Link>
      <span className="hidden sm:inline" style={{ color: "var(--ws-ink-45)" }}>
        /
      </span>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-[5px]"
        >
          <span className="text-[17px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            {active.label}
          </span>
          <span className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
            ▾
          </span>
        </button>

        {open && (
          <div className="ws-card ws-dropdown-in absolute left-0 top-[calc(100%+8px)] z-20 w-[180px] p-[6px]">
            {PRODUCTS.map((p) => (
              <Link
                key={p.key}
                href={p.href}
                onClick={() => setOpen(false)}
                className="ws-row-hover flex items-center justify-between rounded-[6px] px-[10px] py-[8px] text-[12.5px] font-medium"
                style={{ color: p.key === current ? "var(--ws-ink)" : "var(--ws-ink-60)" }}
              >
                {p.label}
                {p.key === current && <span style={{ color: "var(--ws-accent-text)" }}>•</span>}
              </Link>
            ))}
            <div className="my-[4px] h-px" style={{ background: "var(--ws-hairline)" }} />
            <Link
              href="/workspace"
              onClick={() => setOpen(false)}
              className="ws-row-hover block rounded-[6px] px-[10px] py-[8px] text-[12.5px] font-medium"
              style={{ color: "var(--ws-ink-60)" }}
            >
              Workspace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
