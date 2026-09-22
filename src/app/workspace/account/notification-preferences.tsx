"use client";

import { useState } from "react";
import { useToast } from "@/components/ws-toast";
import { NOTIFICATION_CATEGORIES } from "@/lib/notification-prefs";

export function NotificationPreferences({ initialDisabled }: { initialDisabled: string[] }) {
  const toast = useToast();
  const [disabled, setDisabled] = useState<Set<string>>(new Set(initialDisabled));
  const [pending, setPending] = useState<string | null>(null);

  async function toggle(key: string) {
    const enabled = disabled.has(key); // currently disabled -> toggling means enabling
    setPending(key);
    setDisabled((prev) => {
      const next = new Set(prev);
      if (enabled) next.delete(key);
      else next.add(key);
      return next;
    });
    const res = await fetch("/api/notifications/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: key, enabled }),
    });
    setPending(null);
    if (!res.ok) {
      toast("Couldn't save that preference.", "error");
      setDisabled((prev) => {
        const next = new Set(prev);
        if (enabled) next.add(key);
        else next.delete(key);
        return next;
      });
    }
  }

  return (
    <div className="ws-stack">
      {NOTIFICATION_CATEGORIES.map((cat) => {
        const isOn = !disabled.has(cat.key);
        return (
          <div key={cat.key} className="flex items-center" style={{ padding: "11px 16px" }}>
            <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
              {cat.label}
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => toggle(cat.key)}
              disabled={pending === cat.key}
              aria-label={`${isOn ? "Disable" : "Enable"} ${cat.label}`}
              className="relative"
              style={{
                width: 34,
                height: 19,
                borderRadius: 10,
                background: isOn ? "var(--ws-accent)" : "var(--ws-hairline-strong)",
                opacity: pending === cat.key ? 0.6 : 1,
                transition: "background-color 0.15s ease",
              }}
            >
              <span
                className="absolute rounded-full bg-white"
                style={{ width: 15, height: 15, top: 2, left: isOn ? 17 : 2, transition: "left 0.15s ease" }}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
