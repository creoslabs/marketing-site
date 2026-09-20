"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OutlierMark, SignalMark } from "@/components/product-icons";

// A flat list of {label, href, icon} — adding a future Creos product's
// quick action means adding one entry here, not restructuring the menu.
const QUICK_ACTIONS = [
  { label: "Track creator", description: "Add a creator to Outlier", href: "/outlier/creators", icon: <OutlierMark size={16} /> },
  { label: "Analyse creative", description: "Upload an asset to Signal", href: "/signal/analyze", icon: <SignalMark size={16} /> },
];

export function NewMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
