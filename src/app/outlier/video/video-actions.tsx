"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";

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
    setPending(false);
    if (!res.ok) {
      setSaved(!next);
      toast("Couldn't update favourite.", "error");
      return;
    }
    router.refresh();
    if (next) {
      toast("Added to Favourites.", "success");
      router.push("/outlier/favourites");
    }
  }

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

export function RepurposeButton() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast("Repurpose isn't built yet — coming next.")}
      className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
      style={{ padding: "10px 14px" }}
    >
      Repurpose →
    </button>
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
