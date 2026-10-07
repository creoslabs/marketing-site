"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "../../data";
import { useConfirm } from "@/components/ws-confirm";
import { useToast } from "@/components/ws-toast";
import { Icon } from "@/components/app/icons";
import { appStyles as s } from "@/components/app/ui";
import { downloadPostsCsv } from "./export-csv-button";

// "⋯" on the creator header: export, and the one destructive action.
export function CreatorMoreMenu({ creatorId, handle, posts, filename }: { creatorId: string; handle: string; posts: Post[]; filename: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
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

  async function remove() {
    const confirmed = await confirm({
      title: `Stop tracking @${handle}?`,
      description: "This removes the creator, every platform they're tracked on, and all pulled posts. This can't be undone.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!confirmed) return;
    const res = await fetch(`/api/outlier/creators/${creatorId}`, { method: "DELETE" });
    if (res.ok) {
      toast(`Stopped tracking @${handle}.`, "success");
      router.push("/outlier/creators");
      router.refresh();
    } else {
      toast("Couldn't remove that creator.", "error");
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" className={s.iconBtn} style={{ width: 40, height: 40 }} aria-label="More actions" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Icon name="more" size={16} />
      </button>
      {open && (
        <div className={s.menu} role="menu" style={{ minWidth: 200 }}>
          <button
            type="button"
            role="menuitem"
            className={s.menuItem}
            disabled={posts.length === 0}
            onClick={() => {
              setOpen(false);
              downloadPostsCsv(posts, filename);
            }}
          >
            Export CSV
          </button>
          <div className={s.menuRule} />
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
