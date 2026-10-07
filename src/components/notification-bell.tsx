"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { relativeTime } from "@/lib/relative-time";
import { resolveStoredHref, navigateTo } from "@/lib/product-links";
import { Icon } from "@/components/app/icons";
import { appStyles } from "@/components/app/ui";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  created_at: string;
};

type Group = { key: string; label: string; items: Notification[] };

// Purely a display grouping — every notification is still its own row in
// the database, written exactly as before. This only collapses same-day,
// same-kind runs (three pulls today, say) into one line so the dropdown
// doesn't turn into a firehose; nothing about what gets created changes.
function categorize(title: string): string | null {
  if (title.startsWith("Pulled @")) return "pulls completed";
  if (title.startsWith("Pull failed")) return "pulls failed";
  if (title.startsWith("Analysis complete") || title === "Post analyzed") return "analyses completed";
  if (title.startsWith("Analysis failed")) return "analyses failed";
  if (title.includes("median")) return "trend alerts";
  if (title.startsWith("Repurposed")) return "scripts repurposed";
  return null;
}

function groupNotifications(notifications: Notification[]): (Notification | Group)[] {
  const result: (Notification | Group)[] = [];
  let current: (Group & { day: string }) | null = null;

  for (const n of notifications) {
    const label = categorize(n.title);
    const day = n.created_at.slice(0, 10);
    if (!label) {
      current = null;
      result.push(n);
      continue;
    }
    if (current && current.label === label && current.day === day) {
      current.items.push(n);
    } else {
      current = { key: `${label}-${day}-${n.id}`, label, day, items: [n] };
      result.push(current);
    }
  }

  return result.map((item) => ("items" in item && item.items.length === 1 ? item.items[0] : item));
}

// Bell with an unread dot; opens the grouped notifications dropdown.
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupNotifications(notifications);

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
    if (n.href) navigateTo(router, resolveStoredHref(n.href));
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="menu"
        aria-expanded={open}
        className={appStyles.iconBtn}
      >
        <Icon name="bell" size={16} />
        {unreadCount > 0 && <span className={appStyles.unreadDot} />}
      </button>

      {open && (
        <div
          className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+8px)] z-40 w-[340px] overflow-hidden"
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
              grouped.map((item) => {
                if (!("items" in item)) {
                  const n = item;
                  return (
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
                        <span className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
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
                  );
                }

                const group = item;
                const expanded = expandedGroup === group.key;
                const unread = group.items.some((n) => !n.read);
                return (
                  <div key={group.key} style={{ borderBottom: "1px solid var(--ws-hairline)" }}>
                    <button
                      type="button"
                      onClick={() => setExpandedGroup(expanded ? null : group.key)}
                      className="ws-row-hover flex w-full items-center gap-[6px] text-left"
                      style={{ padding: "10px 14px" }}
                    >
                      {unread && <span className="h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: "var(--ws-accent)" }} />}
                      <span className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                        {group.items.length} {group.label}
                      </span>
                      <div className="flex-1" />
                      <span className="shrink-0 text-[10.5px]" style={{ color: "var(--ws-ink-45)" }}>
                        {expanded ? "▾" : "▸"}
                      </span>
                    </button>
                    {expanded && (
                      <div style={{ paddingBottom: 4 }}>
                        {group.items.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => handleClick(n)}
                            className="ws-row-hover flex w-full flex-col items-start text-left"
                            style={{ padding: "8px 14px 8px 26px" }}
                          >
                            <div className="flex w-full items-center gap-[6px]">
                              {!n.read && (
                                <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: "var(--ws-accent)" }} />
                              )}
                              <span className="truncate text-[12px] font-medium" style={{ color: "var(--ws-ink)" }}>
                                {n.title}
                              </span>
                              <div className="flex-1" />
                              <span className="shrink-0 text-[10px]" style={{ color: "var(--ws-ink-45)" }}>
                                {relativeTime(n.created_at)}
                              </span>
                            </div>
                            {n.body && (
                              <p className="mt-[2px] text-[11px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
                                {n.body}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
