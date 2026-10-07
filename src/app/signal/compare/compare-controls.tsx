"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, appStyles as s, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";

type Option = { id: string; filename: string; score: number };

// The filename pill on a compare card: pick a different asset (same format
// only — the options passed in are already filtered).
export function AssetPicker({ current, position, ids, options }: { current: string; position: number; ids: string[]; options: Option[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(id: string) {
    const next = [...ids];
    next[position] = id;
    setOpen(false);
    router.push(`/signal/compare?ids=${next.join(",")}`);
  }

  const taken = new Set(ids);
  const currentName = options.find((o) => o.id === current)?.filename ?? "Choose an asset";

  return (
    <div ref={ref} style={{ position: "relative", alignSelf: "flex-start" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(s.btn, s.btnSm, s.btnGhost)}
        style={{ height: 34, padding: "0 12px", fontSize: 13 }}
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{currentName}</span>
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div className={cx(s.menu, s.menuLeft)} role="listbox" style={{ maxHeight: 320, overflowY: "auto", minWidth: 260 }}>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={o.id === current}
              disabled={taken.has(o.id) && o.id !== current}
              className={s.menuItem}
              style={{ textTransform: "none", letterSpacing: 0, fontSize: 14, opacity: taken.has(o.id) && o.id !== current ? 0.4 : 1, ...(o.id === current ? { color: "var(--ws-accent)" } : null) }}
              onClick={() => choose(o.id)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.filename}</span>
              <span className={s.tabular} style={{ color: "var(--ws-ink-45)" }}>
                {Math.round(o.score)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SwapButton({ ids }: { ids: string[] }) {
  const router = useRouter();
  return (
    <Button variant="ghost" onClick={() => router.push(`/signal/compare?ids=${[...ids].reverse().join(",")}`)}>
      Swap
    </Button>
  );
}

export function ExportCompareButton({ rows, filename }: { rows: string[][]; filename: string }) {
  function download() {
    const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Button variant="ghost" icon="download" onClick={download}>
      Export
    </Button>
  );
}
