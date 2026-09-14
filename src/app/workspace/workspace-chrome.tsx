"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/workspace", label: "Overview" },
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
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.querySelector(".ws");
    setThemeState(root?.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function setTheme(next: "dark" | "light") {
    document.querySelector(".ws")?.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ws-theme", next);
    } catch {
      // ignore — private browsing etc.
    }
    setThemeState(next);
  }

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
              className="ws-card absolute right-0 top-[calc(100%+8px)] z-20 w-[220px] p-[6px]"
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

      <nav
        className="flex items-center gap-[26px] px-6"
        style={{ height: 44, borderBottom: "1px solid var(--ws-hairline)" }}
      >
        {TABS.map((tab) => {
          const active =
            tab.href === "/workspace" ? pathname === "/workspace" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="text-[12.5px] leading-[44px]"
              style={
                active
                  ? {
                      fontWeight: 600,
                      color: "var(--ws-ink)",
                      boxShadow: "inset 0 -1px 0 var(--ws-accent)",
                    }
                  : { fontWeight: 500, color: "var(--ws-ink-60)" }
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
