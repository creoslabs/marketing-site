"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useWsTheme } from "@/components/ws-theme";
import { useCommandPalette } from "@/components/ws-command-palette";
import { NotificationBell } from "@/components/notification-bell";
import { WsTabNav } from "@/components/ws-tab-nav";
import { NewMenu } from "./new-menu";

const TABS = [
  { href: "/workspace", label: "Overview", exact: true },
  { href: "/workspace/account", label: "Account" },
  { href: "/workspace/billing", label: "Billing" },
];

export function WorkspaceChrome({
  name,
  email,
  initials,
}: {
  name: string;
  email: string;
  initials: string;
}) {
  const router = useRouter();
  const [theme, setTheme] = useWsTheme();
  const openPalette = useCommandPalette();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header
        className="flex items-center gap-[22px] px-6"
        style={{ height: 57, borderBottom: "1px solid var(--ws-hairline)" }}
      >
        <Link
          href="/workspace"
          className="text-[17px] font-bold tracking-[-0.02em]"
          style={{ color: "var(--ws-ink)" }}
        >
          Creos Labs
        </Link>

        <div className="flex-1" />

        <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
          Docs
        </span>
        <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
          Support
        </span>

        <NotificationBell />

        <NewMenu />

        <button
          type="button"
          onClick={openPalette}
          className="flex items-center gap-[4px] rounded-[7px] text-[12px] transition-transform active:scale-95"
          style={{ padding: "5px 8px", border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-45)" }}
        >
          ⌘K
        </button>

        <div
          ref={menuRef}
          className="relative flex items-center pl-[18px]"
          style={{ borderLeft: "1px solid var(--ws-hairline)" }}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-[9px]"
          >
            <span
              className="ws-placeholder flex h-[26px] w-[26px] items-center justify-center rounded-full text-[9.5px] font-semibold"
              style={{ color: "var(--ws-ink-60)", border: "1px solid var(--ws-hairline)" }}
            >
              {initials}
            </span>
            <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
              {name}
            </span>
            <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
              ▾
            </span>
          </button>

          {menuOpen && (
            <div
              className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+8px)] z-20 w-[220px] p-[6px]"
            >
              <p
                className="truncate px-[10px] py-[8px] text-[11.5px]"
                style={{ color: "var(--ws-ink-45)" }}
              >
                {email}
              </p>
              <div className="my-[4px] h-px" style={{ background: "var(--ws-hairline)" }} />

              <p
                className="ws-eyebrow px-[10px] pb-[6px] pt-[8px]"
              >
                Appearance
              </p>
              <div
                className="mx-[10px] mb-[8px] flex rounded-[7px] p-[2px]"
                style={{ border: "1px solid var(--ws-hairline)" }}
              >
                {(["dark", "light"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className="flex-1 rounded-[5px] px-[8px] py-[5px] text-[11.5px] font-medium capitalize"
                    style={
                      theme === mode
                        ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
                        : { color: "var(--ws-ink-60)" }
                    }
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="my-[4px] h-px" style={{ background: "var(--ws-hairline)" }} />
              <button
                type="button"
                onClick={handleSignOut}
                className="ws-row-hover w-full rounded-[6px] px-[10px] py-[8px] text-left text-[12.5px] font-medium"
                style={{ color: "var(--ws-ink)" }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="px-6" style={{ height: 44, borderBottom: "1px solid var(--ws-hairline)" }}>
        <WsTabNav tabs={TABS} variant="underline" />
      </nav>
    </>
  );
}
