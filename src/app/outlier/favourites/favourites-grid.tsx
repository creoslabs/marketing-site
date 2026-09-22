"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Collection, Creator, Post } from "../data";
import { Avatar, EmptyState, PlatformBadge, ScoreChip, StatRow, Thumb } from "../components";
import { useToast } from "@/components/ws-toast";

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);
  return ref;
}

function NewCollectionButton() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ws-btn-ghost shrink-0 rounded-[20px] text-[12px] font-medium"
        style={{ padding: "6px 12px" }}
      >
        + New collection
      </button>
    );
  }

  return (
    <div ref={ref} className="flex shrink-0 items-center gap-[6px]">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="Collection name"
        className="text-[12px] outline-none"
        style={{
          width: 140,
          padding: "6px 10px",
          borderRadius: 20,
          border: "1px solid var(--ws-hairline-strong)",
          background: "var(--ws-surface)",
          color: "var(--ws-ink)",
        }}
      />
      <button
        type="button"
        onClick={handleCreate}
        disabled={saving || !name.trim()}
        className="ws-btn-primary shrink-0 rounded-[20px] text-[12px] font-semibold"
        style={{ padding: "6px 12px", opacity: saving ? 0.6 : 1 }}
      >
        Add
      </button>
    </div>
  );
}

function TagPopover({ postId, collections }: { postId: string; collections: Collection[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const ref = useOutsideClose(() => setOpen(false));

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
    <div ref={ref} className="relative" onClick={(e) => e.preventDefault()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Add to collection"
        className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
        style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
      >
        🏷
      </button>
      {open && (
        <div className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+6px)] z-20 w-[190px] p-[6px]">
          {collections.length === 0 ? (
            <p className="px-[10px] py-[8px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
              No collections yet.
            </p>
          ) : (
            collections.map((c) => {
              const checked = c.postIds.includes(postId);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c)}
                  disabled={pending === c.id}
                  className="ws-row-hover flex w-full items-center justify-between rounded-[6px] px-[10px] py-[8px] text-left text-[12.5px] font-medium"
                  style={{ color: checked ? "var(--ws-accent-text)" : "var(--ws-ink)" }}
                >
                  {c.name}
                  {checked && <span>✓</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function FavouritesGrid({
  posts,
  creators,
  collections,
}: {
  posts: Post[];
  creators: Creator[];
  collections: Collection[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const creatorById = new Map(creators.map((c) => [c.id, c]));

  const visiblePosts = activeId ? posts.filter((p) => collections.find((c) => c.id === activeId)?.postIds.includes(p.id)) : posts;

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div>
        <h1 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
          Favourites
        </h1>
        <p className="mt-1 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
          {posts.length} saved post{posts.length === 1 ? "" : "s"}
        </p>
      </div>

      {posts.length > 0 && (
        <div className="mt-[16px] flex flex-wrap items-center gap-[8px]">
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="shrink-0 rounded-[20px] text-[12px] font-medium"
            style={
              activeId === null
                ? { padding: "6px 12px", background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
                : { padding: "6px 12px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-60)" }
            }
          >
            All ({posts.length})
          </button>
          {collections.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className="shrink-0 rounded-[20px] text-[12px] font-medium"
              style={
                activeId === c.id
                  ? { padding: "6px 12px", background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
                  : { padding: "6px 12px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-60)" }
              }
            >
              {c.name} ({c.postIds.length})
            </button>
          ))}
          <NewCollectionButton />
        </div>
      )}

      {posts.length === 0 ? (
        <div className="mt-[18px]">
          <EmptyState
            size="large"
            title="No favourites yet"
            description="Star a post from its video page to save it here for quick reference later."
          />
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="mt-[18px]">
          <EmptyState size="large" title="Nothing in this collection yet" description="Tag a favourite with it from its card's 🏷 button." />
        </div>
      ) : (
        <div className="mt-[18px] grid grid-cols-2 gap-[18px] sm:grid-cols-3 lg:grid-cols-5">
          {visiblePosts.map((post) => {
            const creator = creatorById.get(post.creatorId);
            const handle = creator?.handles.find((h) => h.platform === post.platform)?.handle;
            return (
              <Link key={post.id} href={`/outlier/video/${post.id}`} className="block">
                <Thumb aspectRatio="9/13" radius={11}>
                  {post.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- a scraped CDN URL, not a static asset next/image can optimize
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute left-[8px] top-[8px]" style={{ zIndex: 2 }}>
                    <PlatformBadge platform={post.platform} />
                  </div>
                  <div className="absolute right-[8px] top-[8px]" style={{ zIndex: 2 }}>
                    <TagPopover postId={post.id} collections={collections} />
                  </div>
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      height: 52,
                      background:
                        "linear-gradient(to top, color-mix(in srgb, var(--ws-ground) 70%, transparent), transparent)",
                    }}
                  />
                  <div className="absolute bottom-[8px] left-[8px]" style={{ zIndex: 2 }}>
                    <ScoreChip score={post.score} />
                  </div>
                </Thumb>

                <div className="mt-[8px] flex items-center gap-[7px]">
                  {creator && <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={26} />}
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {handle}
                    </p>
                    <p className="truncate text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                      {post.postedAt}
                    </p>
                  </div>
                </div>
                <div className="mt-[7px]">
                  <StatRow views={post.views} engagement={post.engagement} />
                </div>
                <p
                  className="mt-[6px] text-[11.5px] leading-[1.4]"
                  style={{ color: "var(--ws-ink-60)", textWrap: "pretty" as React.CSSProperties["textWrap"] }}
                >
                  {post.caption.split("\n")[0]}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
