"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { useConfirm } from "@/components/ws-confirm";
import type { Platform } from "./data";

export function AddCreatorButton({ className, style, children }: { className: string; style: React.CSSProperties; children: React.ReactNode }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("TT");
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;
    setSaving(true);
    const res = await fetch("/api/outlier/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, handle: handle.trim() }),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);
    if (res.ok) {
      toast(`Tracking @${handle.trim()}.`, "success");
      setOpen(false);
      setHandle("");
      router.refresh();
    } else {
      toast(data?.error ?? "Couldn't add that creator.", "error");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {children}
      </button>
      {open && (
        <div
          className="ws-overlay-in fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 200, background: "rgba(0,0,0,.5)" }}
          onClick={() => setOpen(false)}
        >
          <div className="ws-card ws-modal-in" style={{ width: 360, padding: "20px" }} onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Add a creator
            </p>
            <form onSubmit={handleSubmit} className="mt-[14px] flex flex-col gap-[10px]">
              <div className="flex rounded-[7px] p-[2px]" style={{ border: "1px solid var(--ws-hairline)" }}>
                {(["TT", "IG"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className="flex-1 rounded-[5px] py-[7px] text-[12px] font-medium"
                    style={
                      platform === p
                        ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
                        : { color: "var(--ws-ink-60)" }
                    }
                  >
                    {p === "TT" ? "TikTok" : "Instagram"}
                  </button>
                ))}
              </div>
              <input
                autoFocus
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="handle (without @)"
                className="text-[12.5px] outline-none"
                style={{
                  padding: "9px 12px",
                  borderRadius: 7,
                  border: "1px solid var(--ws-hairline-strong)",
                  background: "var(--ws-surface)",
                  color: "var(--ws-ink)",
                }}
              />
              <div className="mt-[4px] flex justify-end gap-[8px]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium"
                  style={{ padding: "9px 14px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !handle.trim()}
                  className="ws-btn-primary rounded-[7px] text-[12.5px] font-semibold"
                  style={{ padding: "9px 14px", opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? "Adding…" : "Add creator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function PullCreatorButton({
  creatorId,
  handle,
  className,
  style,
  children = "Pull now",
}: {
  creatorId: string;
  handle: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pulling, setPulling] = useState(false);

  async function handlePull() {
    setPulling(true);
    const res = await fetch("/api/outlier/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId }),
    });
    const data = await res.json().catch(() => null);
    setPulling(false);
    if (res.ok) {
      toast(`Pulled @${handle} — ${data.newCount} new post${data.newCount === 1 ? "" : "s"}.`, "success");
      router.refresh();
    } else {
      toast(data?.error ?? `Couldn't pull @${handle}.`, "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handlePull}
      disabled={pulling}
      className={className ?? "ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"}
      style={{ padding: "10px 14px", opacity: pulling ? 0.6 : 1, ...style }}
    >
      {pulling ? "Pulling…" : children}
    </button>
  );
}

export function PullAllButton({
  creators,
  className,
  style,
  children = "Pull now",
}: {
  creators: { id: string; handle: string }[];
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pulling, setPulling] = useState(false);

  async function handlePullAll() {
    if (creators.length === 0) {
      toast("Add a creator to your watchlist first.");
      return;
    }
    setPulling(true);
    let totalNew = 0;
    let failures = 0;
    for (const creator of creators) {
      const res = await fetch("/api/outlier/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: creator.id }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) totalNew += data.newCount ?? 0;
      else failures += 1;
    }
    setPulling(false);
    if (failures === 0) {
      toast(`Pulled ${creators.length} creator${creators.length === 1 ? "" : "s"} — ${totalNew} new posts.`, "success");
    } else {
      toast(`Pulled with ${failures} failure${failures === 1 ? "" : "s"} — ${totalNew} new posts.`, "error");
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handlePullAll}
      disabled={pulling}
      className={className ?? "ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"}
      style={{ padding: "10px 14px", opacity: pulling ? 0.6 : 1, ...style }}
    >
      {pulling ? "Pulling…" : children}
    </button>
  );
}

export function RemoveCreatorButton({ creatorId, handle }: { creatorId: string; handle: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    const confirmed = await confirm({
      title: `Stop tracking @${handle}?`,
      description: "This removes the creator and all of their pulled posts. This can't be undone.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!confirmed) return;
    setRemoving(true);
    const res = await fetch(`/api/outlier/creators/${creatorId}`, { method: "DELETE" });
    setRemoving(false);
    if (res.ok) {
      toast(`Stopped tracking @${handle}.`, "success");
      router.push("/outlier/creators");
      router.refresh();
    } else {
      toast("Couldn't remove that creator.", "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={removing}
      className="ws-btn-ghost rounded-[7px] text-[11.5px] font-medium"
      style={{ padding: "7px 10px", color: "var(--ws-warn-text)", opacity: removing ? 0.6 : 1 }}
    >
      {removing ? "Removing…" : "Remove"}
    </button>
  );
}
