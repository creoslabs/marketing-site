"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OutlierMark, SignalMark } from "./product-icons";
import { useProductHref, useDashboardHref } from "@/lib/use-product-href";
import { BrandLockupMono } from "@/components/brand";

const PRODUCTS = [
  { key: "outlier", label: "Outlier", Mark: OutlierMark },
  { key: "signal", label: "Signal", Mark: SignalMark },
] as const;

export function ProductSwitcher({ current }: { current: "outlier" | "signal" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = PRODUCTS.find((p) => p.key === current)!;

  // This switcher only ever renders for a signed-in user already inside a
  // product, so every entry should land straight on that product's app —
  // useProductHref(target, "/") would resolve to the subdomain's bare root,
  // which proxy.ts always treats as the public marketing landing page
  // regardless of auth. useDashboardHref goes to "/app" instead, which the
  // proxy maps to the real dashboard tree.
  const workspaceHref = useProductHref("root", "/workspace");
  const outlierHref = useDashboardHref("outlier");
  const signalHref = useDashboardHref("signal");
  const hrefs = { workspace: workspaceHref, outlier: outlierHref, signal: signalHref };

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="ws-row-hover flex items-center whitespace-nowrap"
        style={{ gap: 14, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", padding: "6px 8px", margin: "-6px -8px", borderRadius: 8 }}
      >
        <BrandLockupMono height={20} color="var(--ws-wordmark-ink)" />
        <span style={{ fontWeight: 400, color: "var(--ws-ink-45)" }}>/</span>
        <span className="flex items-center gap-[8px]" style={{ color: "var(--ws-wordmark-ink)", textTransform: "uppercase" }}>
          <active.Mark size={16} />
          {active.label}
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 16 16"
          fill="none"
          style={{ color: "var(--ws-ink-45)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }}
        >
          <path d="M4 6.5 8 10l4-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="ws-card ws-dropdown-in absolute left-0 top-[calc(100%+8px)] z-20 w-[190px] p-[6px]">
          <p className="ws-eyebrow px-[10px] pb-[6px] pt-[4px]">Switch app</p>
          {PRODUCTS.map((p) => (
            <Link
              key={p.key}
              href={hrefs[p.key]}
              onClick={() => setOpen(false)}
              className="ws-row-hover flex items-center justify-between rounded-[6px] px-[10px] py-[9px] text-[14px] uppercase tracking-[0.02em]"
              style={{ color: p.key === current ? "var(--ws-ink)" : "var(--ws-ink-60)", fontWeight: p.key === current ? 600 : 500 }}
            >
              <span className="flex items-center gap-[9px]">
                <p.Mark size={16} />
                {p.label}
              </span>
              {p.key === current && <span style={{ color: "var(--ws-accent-text)" }}>•</span>}
            </Link>
          ))}
          <div className="my-[4px] h-px" style={{ background: "var(--ws-hairline)" }} />
          <Link
            href={hrefs.workspace}
            onClick={() => setOpen(false)}
            className="ws-row-hover block rounded-[6px] px-[10px] py-[9px] text-[14px] font-medium uppercase tracking-[0.02em]"
            style={{ color: "var(--ws-ink-60)" }}
          >
            Workspace
          </Link>
        </div>
      )}
    </div>
  );
}
