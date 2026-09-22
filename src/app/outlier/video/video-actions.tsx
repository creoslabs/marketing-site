"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { usePaletteActions } from "@/components/ws-command-palette";

export function FavouriteButton({ postId, initialFavourited }: { postId: string; initialFavourited: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initialFavourited);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    const next = !saved;
    setSaved(next);
    setPending(true);
    const res = await fetch(`/api/outlier/posts/${postId}/favourite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favourited: next }),
    });
    const data = await res.json().catch(() => null);
    setPending(false);
    if (!res.ok) {
      setSaved(!next);
      toast(data?.error ?? "Couldn't update favourite.", "error");
      return;
    }
    if (next) {
      toast("Added to Favourites.", "success");
      // A plain router.push() can serve a stale, previously-cached render of
      // /outlier/favourites (no router.refresh() targets a route you're
      // navigating *to*) — a full navigation guarantees the freshly
      // favourited post is actually there when the page loads.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard navigation to bypass a stale client router cache
      window.location.href = "/outlier/favourites";
    } else {
      router.refresh();
    }
  }

  // Registered while this button is mounted (i.e. while viewing this
  // post) — the same toggle the button itself triggers, so the palette
  // action and the visible star can never disagree about what "saved"
  // means.
  const paletteActions = useMemo(
    () => [
      {
        key: `favourite-${postId}`,
        label: saved ? "Remove from Favourites" : "Add to Favourites",
        sublabel: "This post",
        run: handleClick,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleClick closes over `saved`/`pending` intentionally; re-created each render is fine here
    [postId, saved]
  );
  usePaletteActions(paletteActions);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="flex-1 rounded-[8px] text-[12.5px] font-medium"
      style={
        saved
          ? {
              padding: "9px 10px",
              background: "var(--ws-accent-tint)",
              border: "1px solid var(--ws-accent-tint-border)",
              color: "var(--ws-accent-tint-ink)",
              opacity: pending ? 0.7 : 1,
            }
          : {
              padding: "9px 10px",
              background: "transparent",
              border: "1px solid var(--ws-hairline)",
              color: "var(--ws-ink-60)",
              opacity: pending ? 0.7 : 1,
            }
      }
    >
      {saved ? "★ Saved" : "☆ Favourite"}
    </button>
  );
}

export function OpenOnPlatformButton({ label, url }: { label: string; url: string }) {
  const toast = useToast();
  if (!url) {
    return (
      <button
        type="button"
        onClick={() => toast("No link for this post yet.")}
        className="flex-1 rounded-[8px] text-[12.5px] font-medium"
        style={{ padding: "9px 10px", background: "transparent", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-60)" }}
      >
        {label} ↗
      </button>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 items-center justify-center rounded-[8px] text-[12.5px] font-medium"
      style={{ padding: "9px 10px", background: "transparent", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-60)" }}
    >
      {label} ↗
    </a>
  );
}

export function RepurposeButton({ postId, ready }: { postId: string; ready: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);

  function handleOpen() {
    if (!ready) {
      toast("Analyze this post first — repurposing borrows its hook and beat structure.");
      return;
    }
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    const res = await fetch(`/api/outlier/posts/${postId}/repurpose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic.trim() }),
    });
    const data = await res.json().catch(() => null);
    setGenerating(false);
    if (res.ok) {
      setOpen(false);
      router.push(`/outlier/repurpose/${data.id}`);
    } else {
      toast(data?.error ?? "Couldn't generate a script.", "error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
        style={{ padding: "10px 14px", opacity: ready ? 1 : 0.6 }}
      >
        Repurpose →
      </button>
      {open && (
        <div
          className="ws-overlay-in fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 200, background: "rgba(0,0,0,.5)" }}
          onClick={() => !generating && setOpen(false)}
        >
          <div className="ws-card ws-modal-in" style={{ width: 400, padding: "20px" }} onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Repurpose this post
            </p>
            <p className="mt-[6px] text-[12px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
              We&rsquo;ll write an original script for your own content, modeled on this post&rsquo;s hook and beat structure —
              not a copy of its words.
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
                  {generating ? "Writing…" : "Generate script"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function AnalyzePostButton({ postId, status }: { postId: string; status: "none" | "analyzing" | "done" | "failed" }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function handleAnalyze() {
    setPending(true);
    const res = await fetch(`/api/outlier/posts/${postId}/analyze`, { method: "POST" });
    const data = await res.json().catch(() => null);
    setPending(false);
    if (res.ok) {
      toast("Transcript and structure are ready.", "success");
      router.refresh();
    } else {
      toast(data?.error ?? "Couldn't analyze this post.", "error");
      router.refresh();
    }
  }

  if (status === "done") return null;

  const busy = pending || status === "analyzing";
  return (
    <button
      type="button"
      onClick={handleAnalyze}
      disabled={busy}
      className="ws-btn-primary w-full rounded-[8px] text-[12.5px] font-semibold"
      style={{ padding: "10px 14px", opacity: busy ? 0.6 : 1 }}
    >
      {busy ? "Transcribing & analyzing…" : status === "failed" ? "Retry analysis" : "Transcribe & analyze"}
    </button>
  );
}
