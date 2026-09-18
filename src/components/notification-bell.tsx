"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { relativeTime } from "@/lib/relative-time";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function refresh() {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : { notifications: [] }))
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setLoaded(true);
      });
  }

  // Poll while mounted so the badge updates even if the bell is never
  // opened — cheap since it's one small query, and this app has no
  // websocket/realtime channel to push updates instead.
  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : { notifications: [] }))
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setLoaded(true);
      });
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
      fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
    }
    setOpen(false);
    if (n.href) router.push(n.href);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-[28px] w-[28px] items-center justify-center rounded-[7px] text-[13px] transition-transform active:scale-95"
        style={{ border: "1px solid var(--ws-hairline)", color: "var(--ws-ink-60)" }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 1.5C6.067 1.5 4.5 3.067 4.5 5v2.086c0 .464-.184.909-.513 1.237l-.94.94A1.25 1.25 0 0 0 4 11.5h8a1.25 1.25 0 0 0 .953-2.237l-.94-.94A1.75 1.75 0 0 1 11.5 7.086V5c0-1.933-1.567-3.5-3.5-3.5Z"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinejoin="round"
          />
          <path d="M6.25 13.25a1.75 1.75 0 0 0 3.5 0" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="ws-tabular absolute flex h-[15px] min-w-[15px] items-center justify-center rounded-full text-[9px] font-semibold"
            style={{ top: -5, right: -5, background: "var(--ws-accent)", color: "var(--ws-accent-ink)", padding: "0 3px" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+8px)] z-20 w-[320px]"
          style={{ padding: 0 }}
        >
          <div className="flex items-center px-[14px] py-[10px]" style={{ borderBottom: "1px solid var(--ws-hairline)" }}>
            <p className="ws-eyebrow">NOTIFICATIONS</p>
            <div className="flex-1" />
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="ws-link-accent text-[11px] font-medium">
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {!loaded ? (
              <p className="px-[14px] py-[18px] text-center text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
                Loading…
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-[14px] py-[18px] text-center text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
                Nothing yet — analysis results and updates will show up here.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className="ws-row-hover flex w-full flex-col items-start text-left"
                  style={{ padding: "10px 14px", borderBottom: "1px solid var(--ws-hairline)" }}
                >
                  <div className="flex w-full items-center gap-[6px]">
                    {!n.read && (
                      <span className="h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: "var(--ws-accent)" }} />
                    )}
                    <span
                      className="truncate text-[12.5px] font-medium"
                      style={{ color: "var(--ws-ink)" }}
                    >
                      {n.title}
                    </span>
                    <div className="flex-1" />
                    <span className="shrink-0 text-[10.5px]" style={{ color: "var(--ws-ink-45)" }}>
                      {relativeTime(n.created_at)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="mt-[3px] text-[11.5px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
                      {n.body}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
