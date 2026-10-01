"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { useConfirm } from "@/components/ws-confirm";
import { parseHandleInput } from "@/lib/outlier/parse-handle-input";
import type { Platform, Post } from "./data";

const PLATFORM_LABEL: Record<Platform, string> = { TT: "TikTok", IG: "Instagram", YT: "YouTube" };

// Runs `fn` over `items` with at most `limit` in flight at once — faster
// than one-at-a-time for a handful of items, but still bounded so pulling an
// entire watchlist (potentially dozens of handles) doesn't fire that many
// concurrent Apify scrapes at once.
async function mapWithConcurrencyLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

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

type HandleRow = { key: number; platform: Platform; handle: string };

let nextRowKey = 1;
function makeRow(platform: Platform = "TT", handle = ""): HandleRow {
  return { key: nextRowKey++, platform, handle };
}

// One creator, many platform handles — matches how a creator page actually
// reads (one profile, several platforms rolled up under it), rather than
// creating a separate "creator" per platform. The first row's platform+
// handle creates the creator (POST /api/outlier/creators, which also sets
// its display name); every row after that attaches to that new creator via
// the same endpoint AddPlatformButton already uses.
export function AddCreatorButton({ className, style, children }: { className: string; style: React.CSSProperties; children: React.ReactNode }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rows, setRows] = useState<HandleRow[]>(() => [makeRow()]);
  const [newHandle, setNewHandle] = useState("");
  const [newPlatform, setNewPlatform] = useState<Platform>("TT");
  const [postLimit, setPostLimit] = useState(30);
  const [saving, setSaving] = useState(false);

  const filledRows = rows.filter((r) => r.handle.trim());

  function updateRow(key: number, patch: Partial<HandleRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function addHandleRow() {
    const parsed = parseHandleInput(newHandle);
    const handle = parsed.handle.replace(/^@/, "");
    if (!handle) return;
    setRows((prev) => [...prev, makeRow(parsed.platform ?? newPlatform, handle)]);
    setNewHandle("");
  }

  function reset() {
    setName("");
    setRows([makeRow()]);
    setNewHandle("");
    setPostLimit(30);
  }

  async function handleSubmit(pullAfter: boolean) {
    if (filledRows.length === 0) return;
    setSaving(true);
    const [first, ...rest] = filledRows;
    const createRes = await fetch("/api/outlier/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: first.platform, handle: first.handle.trim(), displayName: name.trim() }),
    });
    const createData = await createRes.json().catch(() => null);
    if (!createRes.ok || !createData?.creatorId) {
      setSaving(false);
      toast(createData?.error ?? "Couldn't add that creator.", "error");
      return;
    }
    const creatorId = createData.creatorId as string;
    const attachResults = await Promise.all(
      rest.map(async (row) => {
        const res = await fetch(`/api/outlier/creators/${creatorId}/handles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: row.platform, handle: row.handle.trim() }),
        });
        const data = await res.json().catch(() => null);
        return res.ok && data?.handleId ? { ok: true as const, handleId: data.handleId as string } : { ok: false as const };
      })
    );
    const handleIds = attachResults.filter((r) => r.ok).map((r) => r.handleId);
    const attachFailures = attachResults.length - handleIds.length;

    if (pullAfter) {
      await Promise.all(
        [createData.handleId, ...handleIds].map((handleId) =>
          fetch("/api/outlier/pull", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handleId, postLimit }),
          }).catch(() => null)
        )
      );
    }

    setSaving(false);
    setOpen(false);
    reset();
    if (attachFailures > 0) {
      toast(`Added ${name.trim() || first.handle} — ${attachFailures} platform${attachFailures === 1 ? "" : "s"} couldn't be attached.`, "error");
    } else {
      toast(`Now tracking ${name.trim() || first.handle}${pullAfter ? " — pulling now." : "."}`, "success");
    }
    router.refresh();
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
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="ws-card ws-modal-in flex max-h-[85vh] flex-col"
            style={{ width: 480, padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center" style={{ padding: "18px 22px", borderBottom: "1px solid var(--ws-hairline)" }}>
              <p className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
                Add creator
              </p>
              <div className="flex-1" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ color: "var(--ws-ink-45)" }}>
                ✕
              </button>
            </div>

            <div className="overflow-y-auto" style={{ padding: "18px 22px" }}>
              <p className="ws-eyebrow">CREATOR</p>
              <div className="mt-[10px] flex items-center gap-[10px]">
                <span
                  className="ws-placeholder flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ color: "var(--ws-ink-60)" }}
                >
                  {(name || filledRows[0]?.handle || "?").slice(0, 2).toUpperCase()}
                </span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={filledRows[0]?.handle || "Name"}
                  className="flex-1 text-[13px] outline-none"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 7,
                    border: "1px solid var(--ws-hairline-strong)",
                    background: "var(--ws-surface)",
                    color: "var(--ws-ink)",
                  }}
                />
              </div>

              <p className="mt-[18px] ws-eyebrow">HANDLES</p>
              <div className="mt-[10px] flex flex-col gap-[8px]">
                {rows.map((row) => (
                  <div key={row.key} className="flex items-center gap-[8px]">
                    <select
                      value={row.platform}
                      onChange={(e) => updateRow(row.key, { platform: e.target.value as Platform })}
                      className="text-[12.5px] outline-none"
                      style={{
                        padding: "9px 8px",
                        borderRadius: 7,
                        border: "1px solid var(--ws-hairline-strong)",
                        background: "var(--ws-surface)",
                        color: "var(--ws-ink)",
                      }}
                    >
                      {(["TT", "IG", "YT"] as const).map((p) => (
                        <option key={p} value={p}>
                          {PLATFORM_LABEL[p]}
                        </option>
                      ))}
                    </select>
                    <input
                      value={row.handle}
                      onChange={(e) => updateRow(row.key, { handle: e.target.value.replace(/^@/, "") })}
                      placeholder="@handle"
                      className="flex-1 text-[12.5px] outline-none"
                      style={{
                        padding: "9px 12px",
                        borderRadius: 7,
                        border: "1px solid var(--ws-hairline-strong)",
                        background: "var(--ws-surface)",
                        color: "var(--ws-ink)",
                      }}
                    />
                    {rows.length > 1 && (
                      <button type="button" onClick={() => removeRow(row.key)} aria-label="Remove platform" style={{ color: "var(--ws-ink-45)" }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-[8px]">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as Platform)}
                    className="text-[12.5px] outline-none"
                    style={{
                      padding: "9px 8px",
                      borderRadius: 7,
                      border: "1px dashed var(--ws-hairline-strong)",
                      background: "transparent",
                      color: "var(--ws-ink)",
                    }}
                  >
                    {(["TT", "IG", "YT"] as const).map((p) => (
                      <option key={p} value={p}>
                        {PLATFORM_LABEL[p]}
                      </option>
                    ))}
                  </select>
                  <input
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addHandleRow();
                      }
                    }}
                    placeholder="@handle or profile URL"
                    className="flex-1 text-[12.5px] outline-none"
                    style={{
                      padding: "9px 12px",
                      borderRadius: 7,
                      border: "1px dashed var(--ws-hairline-strong)",
                      background: "transparent",
                      color: "var(--ws-ink)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={addHandleRow}
                    className="ws-btn-ghost shrink-0 rounded-[7px] text-[11.5px] font-medium"
                    style={{ padding: "9px 12px" }}
                  >
                    + Add
                  </button>
                </div>
              </div>
              <p className="mt-[10px] text-[11px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
                Each platform is scored against its own median, so 4× on TikTok means the same as 4× on Instagram.
                Handles roll up into one creator page.
              </p>

              <div className="mt-[18px] grid grid-cols-2 gap-[18px]">
                <div>
                  <p className="ws-eyebrow">PULL RANGE</p>
                  <div className="mt-[10px] flex items-center gap-[8px]">
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={postLimit}
                      onChange={(e) => setPostLimit(Math.min(100, Math.max(5, Number(e.target.value) || 30)))}
                      aria-label="Posts to pull per platform"
                      className="text-[12.5px] outline-none"
                      style={{
                        width: 64,
                        padding: "9px 10px",
                        borderRadius: 7,
                        border: "1px solid var(--ws-hairline-strong)",
                        background: "var(--ws-surface)",
                        color: "var(--ws-ink)",
                      }}
                    />
                    <span className="text-[12px]" style={{ color: "var(--ws-ink-60)" }}>posts per platform</span>
                  </div>
                </div>
                <div>
                  <p className="ws-eyebrow">MEDIAN BASELINE</p>
                  <p className="mt-[10px] text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    Trailing 20 posts
                  </p>
                </div>
              </div>
              <p className="mt-[10px] text-[11px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
                Under 12 posts, a platform is marked <span style={{ color: "var(--ws-warn-text)" }}>thin history</span> and
                left out of Trends.
              </p>
            </div>

            <div className="flex items-center gap-[9px]" style={{ padding: "16px 22px", borderTop: "1px solid var(--ws-hairline)" }}>
              <button
                type="button"
                disabled={saving || filledRows.length === 0}
                onClick={() => handleSubmit(true)}
                className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
                style={{ padding: "10px 14px", opacity: saving || filledRows.length === 0 ? 0.6 : 1 }}
              >
                {saving ? "Adding…" : "Add and pull now"}
              </button>
              <button
                type="button"
                disabled={saving || filledRows.length === 0}
                onClick={() => handleSubmit(false)}
                className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
                style={{ padding: "10px 14px", opacity: saving || filledRows.length === 0 ? 0.6 : 1 }}
              >
                Add without pulling
              </button>
            </div>
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
                onChange={(e) => {
                  const parsed = parseHandleInput(e.target.value);
                  if (parsed.platform) {
                    setPlatform(parsed.platform);
                    setHandle(parsed.handle);
                  } else {
                    setHandle(e.target.value);
                  }
                }}
                placeholder="handle or profile URL"
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
    // Up to 4 pulls in flight at once — each is a real Apify scrape, so this
    // stays bounded instead of firing dozens of concurrent requests at once
    // for a large watchlist, while still beating a fully one-at-a-time pull.
    const results = await mapWithConcurrencyLimit(handles, 4, async (h) => {
      const res = await fetch("/api/outlier/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handleId: h.id, postLimit }),
      });
      const data = await res.json().catch(() => null);
      return res.ok ? { ok: true as const, newCount: data.newCount ?? 0, autoAnalyzed: Boolean(data.autoAnalyzed) } : { ok: false as const };
    });
    const totalNew = results.reduce((sum, r) => sum + (r.ok ? r.newCount : 0), 0);
    const autoAnalyzedCount = results.filter((r) => r.ok && r.autoAnalyzed).length;
    const failures = results.filter((r) => !r.ok).length;
    setPulling(false);
    const analyzedSuffix = autoAnalyzedCount > 0 ? ` · top outlier${autoAnalyzedCount === 1 ? "" : "s"} analyzed automatically` : "";
    if (handles.length === 1) {
      if (failures === 0) toast(`Pulled @${handles[0].handle} — ${totalNew} new post${totalNew === 1 ? "" : "s"}${analyzedSuffix}.`, "success");
      else toast(`Couldn't pull @${handles[0].handle}.`, "error");
    } else if (failures === 0) {
      toast(`Pulled ${handles.length} handle${handles.length === 1 ? "" : "s"} — ${totalNew} new posts${analyzedSuffix}.`, "success");
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

// Generates a repurposed script from each of a creator's top analyzed
// outliers in one pass, using the same single-post repurpose endpoint in a
// loop — matching how PullHandlesButton already handles "one action, many
// targets" rather than needing a separate batch API. Repurposing requires
// a post's transcript/beats to already exist, so only analyzed posts are
// eligible; unanalyzed ones (however high-scoring) are skipped.
export function BatchRepurposeButton({
  posts,
  className = "ws-btn-ghost shrink-0 rounded-[8px] text-[12px] font-medium",
  style,
}: {
  posts: Post[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);

  const eligible = [...posts]
    .filter((p) => p.analysisStatus === "done")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  function handleOpen() {
    if (eligible.length === 0) {
      toast("Analyze at least one post first — repurposing borrows its hook and beat structure.");
      return;
    }
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    // eligible is already capped at 3 (see above), so firing these together
    // is a bounded handful of Claude calls, not an open-ended burst.
    const results = await Promise.all(
      eligible.map((post) =>
        fetch(`/api/outlier/posts/${post.id}/repurpose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topic.trim() }),
        }).then((res) => res.ok)
      )
    );
    const successCount = results.filter(Boolean).length;
    const failCount = results.length - successCount;
    setGenerating(false);
    setOpen(false);
    setTopic("");
    if (successCount === 0) {
      toast("Couldn't generate any scripts.", "error");
      return;
    }
    toast(
      failCount === 0
        ? `Generated ${successCount} script${successCount === 1 ? "" : "s"} — see Recent repurposes on Home.`
        : `Generated ${successCount} — ${failCount} failed.`,
      failCount === 0 ? "success" : "error"
    );
    router.push("/outlier");
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={className}
        style={{ padding: "8px 12px", opacity: eligible.length > 0 ? 1 : 0.6, ...style }}
      >
        Repurpose top {eligible.length > 0 ? eligible.length : 3} →
      </button>
      {open && (
        <div
          className="ws-overlay-in fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 200, background: "rgba(0,0,0,.5)" }}
          onClick={() => !generating && setOpen(false)}
        >
          <div className="ws-card ws-modal-in" style={{ width: 400, padding: "20px" }} onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Repurpose top {eligible.length} outlier{eligible.length === 1 ? "" : "s"}
            </p>
            <p className="mt-[6px] text-[12px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
              One topic, {eligible.length} original scripts — each modeled on that post&rsquo;s own hook and beat
              structure, not a copy of its words.
            </p>
            <form onSubmit={handleSubmit} className="mt-[14px] flex flex-col gap-[10px]">
              <textarea
                autoFocus
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What's your content about? e.g. 'budgeting tips for freelancers'"
                rows={3}
                className="text-[12.5px] outline-none"
                style={{
                  padding: "9px 12px",
                  borderRadius: 7,
                  border: "1px solid var(--ws-hairline-strong)",
                  background: "var(--ws-surface)",
                  color: "var(--ws-ink)",
                  resize: "none",
                }}
              />
              <div className="mt-[4px] flex justify-end gap-[8px]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={generating}
                  className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium"
                  style={{ padding: "9px 14px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || !topic.trim()}
                  className="ws-btn-primary rounded-[7px] text-[12.5px] font-semibold"
                  style={{ padding: "9px 14px", opacity: generating ? 0.6 : 1 }}
                >
                  {generating ? "Writing…" : `Generate ${eligible.length} script${eligible.length === 1 ? "" : "s"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
