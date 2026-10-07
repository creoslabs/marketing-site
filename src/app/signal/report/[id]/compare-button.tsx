"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Format } from "../../data";
import { Button, appStyles as s } from "@/components/app/ui";
import { Modal } from "@/components/app/modal";

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
      <Button variant="ghost" onClick={openPicker}>
        Compare
      </Button>
      {open && (
        <Modal
          title="Compare against"
          width={420}
          onClose={() => setOpen(false)}
          footer={
            <Button variant="primary" onClick={handleCompare} disabled={selected.length === 0}>
              Compare {selected.length + 1}
            </Button>
          }
        >
          <p className={s.hint} style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>
            Pick up to {MAX_COMPARE_OTHERS} other {format}s — criteria sets aren’t comparable across formats.
          </p>
          <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {loading ? (
              <p style={{ margin: 0, padding: 16, textAlign: "center", fontSize: 14, color: "var(--ws-ink-45)" }}>Loading…</p>
            ) : options.length === 0 ? (
              <p style={{ margin: 0, padding: 16, textAlign: "center", fontSize: 14, color: "var(--ws-ink-45)" }}>No other {format}s analysed yet.</p>
            ) : (
              options.map((o) => {
                const checked = selected.includes(o.id);
                const disabled = !checked && selected.length >= MAX_COMPARE_OTHERS;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(o.id)}
                    disabled={disabled}
                    className={s.menuItem}
                    style={{ opacity: disabled ? 0.4 : 1, textTransform: "none", letterSpacing: 0, fontSize: 14 }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          flex: "none",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          ...(checked ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" } : { border: "1.5px solid var(--ws-hairline-strong)" }),
                        }}
                      >
                        {checked ? "✓" : ""}
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.filename}</span>
                    </span>
                    <span className={s.tabular} style={{ color: "var(--ws-ink-45)" }}>
                      {o.score}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
