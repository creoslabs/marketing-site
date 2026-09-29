"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useWsTheme } from "@/components/ws-theme";

// Shared avatar + Appearance/sign-out dropdown, used by every product chrome
// (Workspace, Outlier, Signal) so the theme switcher and sign-out live in
// exactly one place instead of being re-implemented per chrome.
export function WsAvatarMenu({ name, email, initials }: { name: string; email: string; initials: string }) {
  const router = useRouter();
  const [theme, setTheme] = useWsTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
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
    <div ref={menuRef} className="relative flex items-center pl-[10px] sm:pl-[20px]" style={{ borderLeft: "1px solid var(--ws-hairline)" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-[9px]">
        <span
          className="ws-placeholder flex h-[26px] w-[26px] items-center justify-center rounded-full text-[9.5px] font-semibold"
          style={{ color: "var(--ws-ink-60)" }}
        >
          {initials}
        </span>
        <span className="hidden text-[12.5px] font-medium sm:inline" style={{ color: "var(--ws-ink)" }}>
          {name}
        </span>
      </button>

      {open && (
        <div className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+8px)] z-20 w-[220px] p-[6px]">
          <p className="truncate px-[10px] py-[8px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
            {email}
          </p>
          <div className="my-[4px] h-px" style={{ background: "var(--ws-hairline)" }} />
          <p className="ws-eyebrow px-[10px] pb-[6px] pt-[8px]">Appearance</p>
          <div className="mx-[10px] mb-[8px] flex rounded-[7px] p-[2px]" style={{ border: "1px solid var(--ws-hairline)" }}>
            {(["dark", "light"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className="flex-1 rounded-[5px] px-[8px] py-[5px] text-[11.5px] font-medium capitalize"
                style={theme === mode ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" } : { color: "var(--ws-ink-60)" }}
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
  );
}
