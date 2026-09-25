"use client";

import { useEffect, useRef, useState } from "react";

export type SortValue = "score" | "views" | "newest" | "oldest";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "score", label: "Score" },
  { value: "views", label: "Views" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);
  return ref;
}

// Sort/filter are applied to data already loaded client-side (no server
// round trip), so these just update local state directly instead of
// pushing a new URL — that used to re-run the whole page's Supabase
// queries on every single checkbox click.
export function SortDropdown({ current, onChange }: { current: SortValue; onChange: (value: SortValue) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const label = SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Score";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
        style={{ padding: "9px 12px" }}
      >
        {label} ▾
      </button>
      {open && (
        <div className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+6px)] z-20 w-[160px] p-[6px]">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="ws-row-hover w-full rounded-[6px] px-[10px] py-[8px] text-left text-[12.5px] font-medium"
              style={{ color: o.value === current ? "var(--ws-accent-text)" : "var(--ws-ink)" }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
