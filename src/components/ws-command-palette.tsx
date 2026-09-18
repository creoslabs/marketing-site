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

const PaletteContext = createContext<(() => void) | null>(null);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    return [...navItems, ...actionItems];
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.sublabel}`.toLowerCase().includes(q));
  }, [items, query]);

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
    <PaletteContext.Provider value={openPalette}>
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
              placeholder="Jump to a page or run a command…"
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
  return ctx;
}
