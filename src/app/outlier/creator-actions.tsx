"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { useConfirm } from "@/components/ws-confirm";
import { Button, Mono, appStyles as s, cx, type ButtonVariant } from "@/components/app/ui";
import { Segmented } from "@/components/app/controls";
import { Icon, type IconName } from "@/components/app/icons";
import { Modal } from "@/components/app/modal";
import { parseHandleInput } from "@/lib/outlier/parse-handle-input";
import type { Platform, Post } from "./data";

const PLATFORM_LABEL: Record<Platform, string> = { TT: "TikTok", IG: "Instagram", YT: "YouTube" };
const PLATFORM_OPTIONS = (["TT", "IG", "YT"] as const).map((p) => ({ value: p, label: PLATFORM_LABEL[p] }));

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

type HandleRow = { key: number; platform: Platform; handle: string };

let nextRowKey = 1;
function makeRow(platform: Platform = "TT", handle = ""): HandleRow {
  return { key: nextRowKey++, platform, handle };
}

function PlatformSelect({ value, onChange, dashed }: { value: Platform; onChange: (p: Platform) => void; dashed?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Platform)} className={cx(s.input, dashed && s.inputDashed)} aria-label="Platform">
      {PLATFORM_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// One creator, many platform handles — matches how a creator page actually
// reads (one profile, several platforms rolled up under it), rather than
// creating a separate "creator" per platform. The first row's platform+
// handle creates the creator (POST /api/outlier/creators, which also sets
// its display name); every row after that attaches to that new creator via
// the same endpoint AddPlatformButton already uses.
export function AddCreatorButton({
  variant = "ghost",
  icon = "plus",
  size,
  children = "Add creator",
}: {
  variant?: ButtonVariant;
  icon?: IconName;
  size?: "md" | "sm";
  children?: React.ReactNode;
}) {
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
      <Button variant={variant} size={size} icon={icon} onClick={() => setOpen(true)}>
        {children}
      </Button>
      {open && (
        <Modal
          title="Add creator"
          busy={saving}
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="primary" disabled={saving || filledRows.length === 0} onClick={() => handleSubmit(true)}>
                {saving ? "Adding…" : "Add and pull now"}
              </Button>
              <Button variant="ghost" disabled={saving || filledRows.length === 0} onClick={() => handleSubmit(false)}>
                Add without pulling
              </Button>
            </>
          }
        >
          <div>
            <Mono className={s.fieldLabel}>Creator</Mono>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={filledRows[0]?.handle || "Name"}
              className={s.input}
              style={{ width: "100%" }}
              aria-label="Creator name"
            />
          </div>

          <div>
            <Mono className={s.fieldLabel}>Handles</Mono>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rows.map((row) => (
                <div key={row.key} className={s.fieldRow}>
                  <PlatformSelect value={row.platform} onChange={(p) => updateRow(row.key, { platform: p })} />
                  <input
                    value={row.handle}
                    onChange={(e) => updateRow(row.key, { handle: e.target.value.replace(/^@/, "") })}
                    placeholder="@handle"
                    className={s.input}
                    style={{ flex: 1, minWidth: 0 }}
                    aria-label="Handle"
                  />
                  {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(row.key)} aria-label="Remove platform" className={s.iconBtn} style={{ width: 32, height: 32 }}>
                      <Icon name="close" size={13} />
                    </button>
                  )}
                </div>
              ))}
              <div className={s.fieldRow}>
                <PlatformSelect value={newPlatform} onChange={setNewPlatform} dashed />
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
                  className={cx(s.input, s.inputDashed)}
                  style={{ flex: 1, minWidth: 0 }}
                  aria-label="Another handle or profile URL"
                />
                <Button variant="ghost" size="sm" icon="plus" onClick={addHandleRow}>
                  Add
                </Button>
              </div>
            </div>
            <p className={s.hint} style={{ marginTop: 10 }}>
              Each platform is scored against its own median, so 4× on TikTok means the same as 4× on Instagram. Handles roll up into one creator page.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <Mono className={s.fieldLabel}>Pull range</Mono>
              <div className={s.fieldRow}>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={postLimit}
                  onChange={(e) => setPostLimit(Math.min(100, Math.max(5, Number(e.target.value) || 30)))}
                  aria-label="Posts to pull per platform"
                  className={s.input}
                  style={{ width: 72 }}
                />
                <span style={{ fontSize: 13, color: "var(--ws-ink-60)" }}>posts per platform</span>
              </div>
            </div>
            <div>
              <Mono className={s.fieldLabel}>Median baseline</Mono>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Trailing 20 posts</span>
            </div>
          </div>
          <p className={s.hint}>
            Under 12 posts, a platform is marked <span style={{ color: "var(--ws-warn)" }}>thin history</span> and left out of Trends.
          </p>
        </Modal>
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
      <Button variant="ghost" size="sm" icon="plus" onClick={() => setOpen(true)}>
        Platform
      </Button>
      {open && (
        <Modal title="Track another platform" width={400} busy={saving} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Segmented label="Platform" value={platform} options={PLATFORM_OPTIONS} onChange={setPlatform} />
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
              className={s.input}
              aria-label="Handle or profile URL"
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving || !handle.trim()}>
                {saving ? "Adding…" : "Add platform"}
              </Button>
            </div>
          </form>
        </Modal>
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
  variant = "primary",
  size,
  icon,
  children = "Pull now",
}: {
  handles: { id: string; handle: string }[];
  postLimit?: number;
  variant?: ButtonVariant;
  size?: "md" | "sm";
  icon?: IconName;
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
    <Button variant={variant} size={size} icon={pulling ? undefined : icon} onClick={handlePull} disabled={pulling}>
      {pulling ? "Pulling…" : children}
    </Button>
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
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="number"
        min={5}
        max={100}
        value={postLimit}
        onChange={(e) => setPostLimit(Math.min(100, Math.max(5, Number(e.target.value) || 30)))}
        aria-label="Posts to pull"
        className={s.input}
        style={{ width: 72 }}
      />
      <PullHandlesButton handles={handles} postLimit={postLimit} icon="refresh" />
    </div>
  );
}

function useRemoveCreator(creatorId: string, handle: string) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [removing, setRemoving] = useState(false);

  async function remove() {
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
  return { remove, removing };
}

export function RemoveCreatorButton({ creatorId, handle }: { creatorId: string; handle: string }) {
  const { remove, removing } = useRemoveCreator(creatorId, handle);
  return (
    <Button variant="danger" size="sm" onClick={remove} disabled={removing}>
      {removing ? "Removing…" : "Remove"}
    </Button>
  );
}

// "⋯" menu on a creator row. Destructive actions live one step removed,
// here, instead of as a button in every row.
export function CreatorRowMenu({ creatorId, handle }: { creatorId: string; handle: string }) {
  const { remove, removing } = useRemoveCreator(creatorId, handle);
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

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className={s.iconBtn}
        aria-label={`More actions for @${handle}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        disabled={removing}
      >
        <Icon name="more" size={16} />
      </button>
      {open && (
        <div className={s.menu} role="menu" style={{ minWidth: 190 }}>
          <button
            type="button"
            role="menuitem"
            className={s.menuItem}
            style={{ color: "var(--ws-warn)" }}
            onClick={() => {
              setOpen(false);
              remove();
            }}
          >
            Remove creator
          </button>
        </div>
      )}
    </div>
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
      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ws-ink-45)", padding: 4, opacity: removing ? 0.6 : 1 }}
    >
      <Icon name="close" size={12} />
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
  variant = "ghost",
  size = "sm",
}: {
  posts: Post[];
  variant?: ButtonVariant;
  size?: "md" | "sm";
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
      <Button variant={variant} size={size} onClick={handleOpen}>
        Repurpose top {eligible.length > 0 ? eligible.length : 3} →
      </Button>
      {open && (
        <Modal title={`Repurpose top ${eligible.length} outlier${eligible.length === 1 ? "" : "s"}`} width={440} busy={generating} onClose={() => setOpen(false)}>
          <p className={s.hint} style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>
            One topic, {eligible.length} original scripts — each modeled on that post’s own hook and beat structure, not a copy of its words.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <textarea
              autoFocus
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What's your content about? e.g. 'budgeting tips for freelancers'"
              rows={3}
              className={s.input}
              aria-label="Topic"
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={generating}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={generating || !topic.trim()}>
                {generating ? "Writing…" : `Generate ${eligible.length} script${eligible.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
