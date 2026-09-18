"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Format } from "../../data";

type Option = { id: string; filename: string; score: number };

export function CompareButton({ assetId, format }: { assetId: string; format: Format }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  async function openPicker() {
    setOpen(true);
    setLoading(true);
    const res = await fetch(`/api/signal/assets?format=${format}`);
    const data = await res.json();
    const assets: Option[] = data.assets ?? [];
    setOptions(assets.filter((a) => a.id !== assetId));
    setLoading(false);
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
              Only other {format}s — criteria sets aren&apos;t comparable across formats.
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
                options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => router.push(`/signal/compare?a=${assetId}&b=${o.id}`)}
                    className="ws-row-hover flex w-full items-center justify-between rounded-[6px] text-left"
                    style={{ padding: "9px 10px" }}
                  >
                    <span className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {o.filename}
                    </span>
                    <span className="ws-tabular text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
                      {o.score}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
