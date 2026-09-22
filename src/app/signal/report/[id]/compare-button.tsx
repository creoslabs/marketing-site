"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Format } from "../../data";

type Option = { id: string; filename: string; score: number };

const MAX_COMPARE_OTHERS = 3; // plus this asset itself = 4 total

export function CompareButton({ assetId, format }: { assetId: string; format: Format }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  async function openPicker() {
    setOpen(true);
    setLoading(true);
    setSelected([]);
    const res = await fetch(`/api/signal/assets?format=${format}`);
    const data = await res.json();
    const assets: Option[] = data.assets ?? [];
    setOptions(assets.filter((a) => a.id !== assetId));
    setLoading(false);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE_OTHERS) return prev;
      return [...prev, id];
    });
  }

  function handleCompare() {
    if (selected.length === 0) return;
    router.push(`/signal/compare?ids=${[assetId, ...selected].join(",")}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium"
        style={{ padding: "9px 12px" }}
      >
        Compare
      </button>
      {open && (
        <div
          className="ws-overlay-in fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 200, background: "rgba(0,0,0,.5)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="ws-card ws-modal-in"
            style={{ width: 360, padding: "18px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[14px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Compare against
            </p>
            <p className="mt-[4px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
              Pick up to {MAX_COMPARE_OTHERS} other {format}s — criteria sets aren&apos;t comparable across formats.
            </p>
            <div className="mt-[12px]" style={{ maxHeight: 280, overflowY: "auto" }}>
              {loading ? (
                <p className="py-[16px] text-center text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
                  Loading…
                </p>
              ) : options.length === 0 ? (
                <p className="py-[16px] text-center text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
                  No other {format}s analyzed yet.
                </p>
              ) : (
                options.map((o) => {
                  const checked = selected.includes(o.id);
                  const disabled = !checked && selected.length >= MAX_COMPARE_OTHERS;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggle(o.id)}
                      disabled={disabled}
                      className="ws-row-hover flex w-full items-center justify-between rounded-[6px] text-left"
                      style={{ padding: "9px 10px", opacity: disabled ? 0.4 : 1 }}
                    >
                      <span className="flex items-center gap-[8px]">
                        <span
                          className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] text-[10px]"
                          style={
                            checked
                              ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
                              : { border: "1px solid var(--ws-hairline-strong)" }
                          }
                        >
                          {checked ? "✓" : ""}
                        </span>
                        <span className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                          {o.filename}
                        </span>
                      </span>
                      <span className="ws-tabular text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
                        {o.score}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <button
              type="button"
              onClick={handleCompare}
              disabled={selected.length === 0}
              className="ws-btn-primary mt-[12px] w-full rounded-[7px] text-[12.5px] font-semibold"
              style={{ padding: "10px 14px", opacity: selected.length === 0 ? 0.6 : 1 }}
            >
              Compare {selected.length + 1}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
