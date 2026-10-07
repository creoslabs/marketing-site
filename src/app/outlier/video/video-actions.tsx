"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { usePaletteActions } from "@/components/ws-command-palette";
import { Button, appStyles as s } from "@/components/app/ui";
import { Modal } from "@/components/app/modal";

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
    <Button variant={saved ? "paper" : "ghost"} onClick={handleClick} disabled={pending} style={{ flex: 1 }}>
      {saved ? "★ Saved" : "☆ Favourite"}
    </Button>
  );
}

export function OpenOnPlatformButton({ label, url }: { label: string; url: string }) {
  const toast = useToast();
  if (!url) {
    return (
      <Button variant="ghost" onClick={() => toast("No link for this post yet.")} style={{ flex: 1 }}>
        {label} ↗
      </Button>
    );
  }
  return (
    <Button variant="ghost" href={url} external style={{ flex: 1 }}>
      {label} ↗
    </Button>
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
      <Button variant="primary" onClick={handleOpen} style={{ opacity: ready ? 1 : 0.6 }}>
        Repurpose into a script
      </Button>
      {open && (
        <Modal title="Repurpose this post" width={440} busy={generating} onClose={() => setOpen(false)}>
          <p className={s.hint} style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>
            We’ll write an original script for your own content, modeled on this post’s hook and beat structure — not a copy of its words.
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
                {generating ? "Writing…" : "Generate script"}
              </Button>
            </div>
          </form>
        </Modal>
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
    <Button variant="primary" onClick={handleAnalyze} disabled={busy}>
      {busy ? "Transcribing & analyzing…" : status === "failed" ? "Retry analysis" : "Transcribe & analyze"}
    </Button>
  );
}
