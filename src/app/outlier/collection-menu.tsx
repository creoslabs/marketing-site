"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { Button, Mono, appStyles as s, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";
import type { Collection } from "./data";

function useOutside(onClose: () => void, active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, active]);
  return ref;
}

// Toggle a post in/out of a collection. `trigger="button"` is the labelled
// header action on the post page; `trigger="icon"` is the compact tag button
// that overlays a favourites card.
export function CollectionMenu({ postId, collections, trigger = "button" }: { postId: string; collections: Collection[]; trigger?: "button" | "icon" }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const ref = useOutside(() => setOpen(false), open);

  async function toggle(collection: Collection) {
    const inCollection = collection.postIds.includes(postId);
    setPending(collection.id);
    const res = inCollection
      ? await fetch(`/api/outlier/collections/${collection.id}/posts/${postId}`, { method: "DELETE" })
      : await fetch(`/api/outlier/collections/${collection.id}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
    setPending(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      toast(data?.error ?? "Couldn't update that collection.", "error");
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }} onClick={(e) => e.preventDefault()}>
      {trigger === "button" ? (
        <Button variant="ghost" icon="plus" onClick={() => setOpen((v) => !v)}>
          Add to collection
        </Button>
      ) : (
        <button
          type="button"
          aria-label="Add to collection"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={s.iconBtn}
          style={{ width: 30, height: 30, background: "rgba(0,0,0,0.55)", borderColor: "transparent" }}
        >
          <Icon name="plus" size={14} />
        </button>
      )}
      {open && (
        <div className={s.menu} role="menu" style={{ minWidth: 220 }}>
          <Mono className={s.menuLabel}>Collections</Mono>
          {collections.length === 0 ? (
            <p style={{ margin: 0, padding: "8px 12px 12px", fontSize: 13, color: "var(--ws-ink-45)" }}>No collections yet — create one from Favourites.</p>
          ) : (
            collections.map((c) => {
              const checked = c.postIds.includes(postId);
              return (
                <button
                  key={c.id}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={checked}
                  disabled={pending === c.id}
                  className={cx(s.menuItem)}
                  style={checked ? { color: "var(--ws-accent)" } : undefined}
                  onClick={() => toggle(c)}
                >
                  {c.name}
                  {checked && <Icon name="check" size={14} />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// "New collection" — a button that turns into an inline name field.
export function NewCollectionButton({ primary }: { primary?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useOutside(() => setOpen(false), open);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/outlier/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      setName("");
      router.refresh();
    } else {
      toast(data?.error ?? "Couldn't create that collection.", "error");
    }
  }

  if (!open) {
    return (
      <Button variant={primary ? "primary" : "ghost"} size={primary ? "md" : "sm"} icon="plus" onClick={() => setOpen(true)}>
        New collection
      </Button>
    );
  }

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="Collection name"
        className={s.input}
        style={{ width: 180, height: 36, borderRadius: 999 }}
        aria-label="Collection name"
      />
      <Button variant="primary" size="sm" onClick={handleCreate} disabled={saving || !name.trim()}>
        {saving ? "Creating…" : "Create"}
      </Button>
    </div>
  );
}
