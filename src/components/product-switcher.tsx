"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OutlierMark, SignalMark } from "./product-icons";
import { useProductHref } from "@/lib/use-product-href";

const PRODUCTS = [
  { key: "outlier", label: "Outlier", Mark: OutlierMark },
  { key: "signal", label: "Signal", Mark: SignalMark },
] as const;

export function ProductSwitcher({ current }: { current: "outlier" | "signal" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = PRODUCTS.find((p) => p.key === current)!;

  // Outlier and Signal each live on their own subdomain — a plain relative
  // href would resolve against the CURRENT subdomain and 404.
  const workspaceHref = useProductHref("root", "/workspace");
  const outlierHref = useProductHref("outlier", "/");
  const signalHref = useProductHref("signal", "/");
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
        className="flex items-center whitespace-nowrap"
        style={{ gap: 14, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em" }}
      >
        <span style={{ color: "var(--ws-wordmark-ink)" }}>
          CREOS LABS<sup style={{ fontSize: 8, marginLeft: 1 }}>®</sup>
        </span>
        <span style={{ fontWeight: 400, color: "var(--ws-ink-45)" }}>/</span>
        <span className="flex items-center gap-[7px]" style={{ color: "var(--ws-wordmark-ink)", textTransform: "uppercase" }}>
          <active.Mark size={14} />
          {active.label}
        </span>
      </button>

      {open && (
        <div className="ws-card ws-dropdown-in absolute left-0 top-[calc(100%+8px)] z-20 w-[180px] p-[6px]">
          {PRODUCTS.map((p) => (
            <Link
              key={p.key}
              href={hrefs[p.key]}
              onClick={() => setOpen(false)}
              className="ws-row-hover flex items-center justify-between rounded-[6px] px-[10px] py-[8px] text-[12.5px] font-medium"
              style={{ color: p.key === current ? "var(--ws-ink)" : "var(--ws-ink-60)" }}
            >
              <span className="flex items-center gap-[8px]">
                <p.Mark size={15} />
                {p.label}
              </span>
              {p.key === current && <span style={{ color: "var(--ws-accent-text)" }}>•</span>}
            </Link>
          ))}
          <div className="my-[4px] h-px" style={{ background: "var(--ws-hairline)" }} />
          <Link
            href={hrefs.workspace}
            onClick={() => setOpen(false)}
            className="ws-row-hover block rounded-[6px] px-[10px] py-[8px] text-[12.5px] font-medium"
            style={{ color: "var(--ws-ink-60)" }}
          >
            Workspace
          </Link>
        </div>
      )}
    </div>
  );
}
