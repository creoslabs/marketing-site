"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Platform } from "../data";

const SORT_OPTIONS = [
  { value: "score", label: "Score" },
  { value: "views", label: "Views" },
  { value: "recent", label: "Most recent" },
] as const;

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "TT", label: "TikTok" },
  { value: "IG", label: "Instagram" },
  { value: "YT", label: "YouTube" },
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

export function SortDropdown({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const label = SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Score";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

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
              onClick={() => select(o.value)}
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

export function PlatformFilter({ selected }: { selected: Platform[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const excluded = PLATFORM_OPTIONS.length - selected.length;

  function toggle(platform: Platform) {
    const next = selected.includes(platform) ? selected.filter((p) => p !== platform) : [...selected, platform];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length === PLATFORM_OPTIONS.length || next.length === 0) {
      params.delete("platforms");
    } else {
      params.set("platforms", next.join(","));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
        style={{ padding: "9px 12px" }}
      >
        {excluded > 0 ? `Filters · ${excluded}` : "Filters"}
      </button>
      {open && (
        <div className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+6px)] z-20 w-[170px] p-[6px]">
          {PLATFORM_OPTIONS.map((o) => (
            <label
              key={o.value}
              className="ws-row-hover flex w-full items-center gap-[9px] rounded-[6px] px-[10px] py-[8px] text-[12.5px] font-medium"
              style={{ color: "var(--ws-ink)" }}
            >
              <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
