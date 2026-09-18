"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { useConfirm } from "@/components/ws-confirm";
import type { Platform } from "./data";

const PLATFORM_LABEL: Record<Platform, string> = { TT: "TikTok", IG: "Instagram", YT: "YouTube" };

function PlatformPicker({ platform, onChange }: { platform: Platform; onChange: (p: Platform) => void }) {
  return (
    <div className="flex rounded-[7px] p-[2px]" style={{ border: "1px solid var(--ws-hairline)" }}>
      {(["TT", "IG", "YT"] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className="flex-1 rounded-[5px] py-[7px] text-[12px] font-medium"
          style={platform === p ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" } : { color: "var(--ws-ink-60)" }}
        >
          {PLATFORM_LABEL[p]}
        </button>
      ))}
    </div>
  );
}

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
              <PlatformPicker platform={platform} onChange={setPlatform} />
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

// Tracks another platform for a creator who's already on the watchlist —
// e.g. the same person's Instagram alongside a TikTok already tracked.
export function AddPlatformButton({ creatorId }: { creatorId: string }) {
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
    const res = await fetch(`/api/outlier/creators/${creatorId}/handles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, handle: handle.trim() }),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);
    if (res.ok) {
      toast(`Also tracking @${handle.trim()} on ${PLATFORM_LABEL[platform]}.`, "success");
      setOpen(false);
      setHandle("");
      router.refresh();
    } else {
      toast(data?.error ?? "Couldn't add that platform.", "error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ws-btn-ghost rounded-[7px] text-[11.5px] font-medium"
        style={{ padding: "7px 10px" }}
      >
        + Platform
      </button>
      {open && (
        <div
          className="ws-overlay-in fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 200, background: "rgba(0,0,0,.5)" }}
          onClick={() => setOpen(false)}
        >
          <div className="ws-card ws-modal-in" style={{ width: 360, padding: "20px" }} onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Track another platform
            </p>
            <form onSubmit={handleSubmit} className="mt-[14px] flex flex-col gap-[10px]">
              <PlatformPicker platform={platform} onChange={setPlatform} />
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
                  {saving ? "Adding…" : "Add platform"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Pulls one or more handles sequentially — a single handle, every handle a
// creator has, or every handle across the whole watchlist, depending on
// what's passed in.
export function PullHandlesButton({
  handles,
  postLimit,
  className,
  style,
  children = "Pull now",
}: {
  handles: { id: string; handle: string }[];
  postLimit?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pulling, setPulling] = useState(false);

  async function handlePull() {
    if (handles.length === 0) {
      toast("Add a creator to your watchlist first.");
      return;
    }
    setPulling(true);
    let totalNew = 0;
    let failures = 0;
    for (const h of handles) {
      const res = await fetch("/api/outlier/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handleId: h.id, postLimit }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) totalNew += data.newCount ?? 0;
      else failures += 1;
    }
    setPulling(false);
    if (handles.length === 1) {
      if (failures === 0) toast(`Pulled @${handles[0].handle} — ${totalNew} new post${totalNew === 1 ? "" : "s"}.`, "success");
      else toast(`Couldn't pull @${handles[0].handle}.`, "error");
    } else if (failures === 0) {
      toast(`Pulled ${handles.length} handle${handles.length === 1 ? "" : "s"} — ${totalNew} new posts.`, "success");
    } else {
      toast(`Pulled with ${failures} failure${failures === 1 ? "" : "s"} — ${totalNew} new posts.`, "error");
    }
    router.refresh();
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

// Pairs a "how many posts" picker with the pull action — used where fine-
// tuning a pull is worth the extra control (Creator Detail). Other quick
// pull actions (Home's "pull all", a thin-history nudge) just use
// PullHandlesButton with its default limit, since those are meant to be
// one-click, not a decision point.
export function PullWithLimit({ handles }: { handles: { id: string; handle: string }[] }) {
  const [postLimit, setPostLimit] = useState(30);

  return (
    <div className="flex items-center gap-[8px]">
      <input
        type="number"
        min={5}
        max={100}
        value={postLimit}
        onChange={(e) => setPostLimit(Math.min(100, Math.max(5, Number(e.target.value) || 30)))}
        aria-label="Posts to pull"
        className="text-[12.5px] outline-none"
        style={{
          width: 56,
          padding: "9px 8px",
          borderRadius: 7,
          border: "1px solid var(--ws-hairline-strong)",
          background: "var(--ws-surface)",
          color: "var(--ws-ink)",
        }}
      />
      <PullHandlesButton handles={handles} postLimit={postLimit} className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" />
    </div>
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
      description: "This removes the creator, every platform they're tracked on, and all pulled posts. This can't be undone.",
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

// Removes a single platform from a creator (not the whole creator).
export function RemoveHandleButton({ handleId, handle }: { handleId: string; handle: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    const confirmed = await confirm({
      title: `Stop tracking @${handle}?`,
      description: "This removes this platform and its pulled posts. Other platforms for this creator stay.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!confirmed) return;
    setRemoving(true);
    const res = await fetch(`/api/outlier/handles/${handleId}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setRemoving(false);
    if (res.ok) {
      toast(`Stopped tracking @${handle}.`, "success");
      if (data?.creatorRemoved) router.push("/outlier/creators");
      router.refresh();
    } else {
      toast("Couldn't remove that platform.", "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={removing}
      aria-label={`Stop tracking @${handle}`}
      className="text-[11px] font-medium"
      style={{ color: "var(--ws-ink-45)", opacity: removing ? 0.6 : 1 }}
    >
      ✕
    </button>
  );
}
