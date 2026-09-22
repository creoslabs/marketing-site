"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Destination = { label: string; href: string; group: string };

const DESTINATIONS: Destination[] = [
  { label: "Overview", href: "/workspace", group: "Workspace" },
  { label: "Account", href: "/workspace/account", group: "Workspace" },
  { label: "Billing", href: "/workspace/billing", group: "Workspace" },
  { label: "Home", href: "/outlier", group: "Outlier" },
  { label: "Feed", href: "/outlier/feed", group: "Outlier" },
  { label: "Favourites", href: "/outlier/favourites", group: "Outlier" },
  { label: "Creators", href: "/outlier/creators", group: "Outlier" },
  { label: "Progress", href: "/outlier/progress", group: "Outlier" },
  { label: "Library", href: "/signal", group: "Signal" },
  { label: "Analyze", href: "/signal/analyze", group: "Signal" },
  { label: "Benchmarks", href: "/signal/benchmarks", group: "Signal" },
];

type Item = { key: string; label: string; sublabel: string; run: () => void };

type PaletteContextValue = {
  open: () => void;
  setContextActions: (actions: Item[]) => void;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchItems, setSearchItems] = useState<Item[]>([]);
  // Whatever page is currently mounted can register its own actions here
  // (see usePaletteActions) — e.g. "Favourite this post" while looking at
  // one. Cleared whenever that page unmounts, so stale actions never
  // linger once you navigate away.
  const [contextActions, setContextActions] = useState<Item[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced live search over the caller's own creators/posts/Signal
  // assets — separate from the static DESTINATIONS list below, which is
  // just page navigation and matches instantly with no network call.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`).catch(() => null);
      if (!res || !res.ok || cancelled) return;
      const data = await res.json().catch(() => null);
      if (!data || cancelled) return;
      const results: Item[] = [
        ...data.creators.map((c: { id: string; label: string }) => ({
          key: `creator-${c.id}`,
          label: c.label,
          sublabel: "Creator",
          run: () => router.push(`/outlier/creators/${c.id}`),
        })),
        ...data.posts.map((p: { id: string; label: string }) => ({
          key: `post-${p.id}`,
          label: p.label,
          sublabel: "Post",
          run: () => router.push(`/outlier/video/${p.id}`),
        })),
        ...data.assets.map((a: { id: string; label: string }) => ({
          key: `asset-${a.id}`,
          label: a.label,
          sublabel: "Signal asset",
          run: () => router.push(`/signal/report/${a.id}`),
        })),
      ];
      if (!cancelled) {
        setSearchItems(results);
        setActiveIndex(0);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, router]);

  const items = useMemo<Item[]>(() => {
    const navItems: Item[] = DESTINATIONS.map((d) => ({
      key: d.href,
      label: d.label,
      sublabel: d.group,
      run: () => router.push(d.href),
    }));
    const actionItems: Item[] = [
      {
        key: "sign-out",
        label: "Sign out",
        sublabel: "Account",
        run: async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.push("/login");
          router.refresh();
        },
      },
    ];
    return [...contextActions, ...navItems, ...actionItems];
  }, [router, contextActions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const matchingNav = items.filter((item) => `${item.label} ${item.sublabel}`.toLowerCase().includes(q));
    const effectiveSearchItems = q.length >= 2 ? searchItems : [];
    return [...effectiveSearchItems, ...matchingNav];
  }, [items, query, searchItems]);

  function openPalette() {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }

  function closePalette() {
    setOpen(false);
  }

  function runItem(item: Item) {
    item.run();
    closePalette();
  }

  // Global Cmd/Ctrl+K, from anywhere in the product (not just when a visible
  // "⌘K" box happens to be on screen).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setActiveIndex(0);
          }
          return !prev;
        });
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) runItem(item);
    }
  }

  return (
    <PaletteContext.Provider value={{ open: openPalette, setContextActions }}>
      {children}
      {open && (
        <div
          className="ws-overlay-in fixed inset-0 flex items-start justify-center px-6"
          style={{ zIndex: 250, background: "rgba(0,0,0,.5)", paddingTop: "12vh" }}
          onClick={closePalette}
        >
          <div
            className="ws-card ws-modal-in"
            style={{ width: 480, maxHeight: "60vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Jump to a page, creator, post, or asset…"
              className="w-full text-[13.5px]"
              style={{
                padding: "16px 18px",
                background: "transparent",
                borderBottom: "1px solid var(--ws-hairline)",
                color: "var(--ws-ink)",
                outline: "none",
              }}
            />
            <div style={{ overflowY: "auto", padding: 6 }}>
              {filtered.length === 0 ? (
                <p className="px-[12px] py-[16px] text-[12.5px]" style={{ color: "var(--ws-ink-45)" }}>
                  No matches.
                </p>
              ) : (
                filtered.map((item, i) => (
                  <button
                    key={item.key}
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => runItem(item)}
                    className="flex w-full items-center justify-between rounded-[7px] text-left"
                    style={{
                      padding: "10px 12px",
                      background: i === activeIndex ? "var(--ws-surface-header)" : "transparent",
                    }}
                  >
                    <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {item.label}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                      {item.sublabel}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PaletteContext.Provider>
  );
}

// Call this to open the palette imperatively — e.g. from the "⌘K" box in a
// chrome header. Cmd/Ctrl+K works globally regardless of who calls this.
export function useCommandPalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  return ctx.open;
}

// Lets the current page contribute its own actions to the palette while
// mounted — e.g. a video page registering "Favourite this post." Pass a
// memoized array (useMemo) since a new array identity every render would
// just mean re-registering on every render; harmless, but wasteful.
export function usePaletteActions(actions: { key: string; label: string; sublabel: string; run: () => void }[]) {
  const ctx = useContext(PaletteContext);
  useEffect(() => {
    ctx?.setContextActions(actions);
    return () => ctx?.setContextActions([]);
  }, [ctx, actions]);
}
