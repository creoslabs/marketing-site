"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OutlierMark, SignalMark } from "@/components/product-icons";
import { useProductHref } from "@/lib/use-product-href";

export function NewMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Workspace always renders at the root domain, so these are always
  // cross-subdomain links once Outlier/Signal move to their own.
  const QUICK_ACTIONS = [
    {
      label: "Track creator",
      description: "Add a creator to Outlier",
      href: useProductHref("outlier", "/creators"),
      icon: <OutlierMark size={16} />,
    },
    {
      label: "Analyse creative",
      description: "Upload an asset to Signal",
      href: useProductHref("signal", "/analyze"),
      icon: <SignalMark size={16} />,
    },
  ];

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
        className="ws-btn-primary flex items-center gap-[5px] rounded-[7px] text-[12.5px] font-semibold"
        style={{ padding: "7px 12px" }}
      >
        + New
      </button>
      {open && (
        <div className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+8px)] z-20 w-[220px] p-[6px]">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setOpen(false)}
              className="ws-row-hover flex items-center gap-[10px] rounded-[6px] px-[10px] py-[9px] text-left"
            >
              <span style={{ color: "var(--ws-ink-60)" }}>{action.icon}</span>
              <span>
                <span className="block text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                  {action.label}
                </span>
                <span className="block text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                  {action.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
