"use client";

import { useState } from "react";
import { useToast } from "@/components/ws-toast";
import { NOTIFICATION_CATEGORIES } from "@/lib/notification-prefs";
import { Switch } from "@/components/app/controls";
import { SettingsRow } from "@/components/app/settings";

// Which product each email category belongs to — shown muted beside the label.
const PRODUCT: Record<string, string> = {
  pull: "Outlier",
  pull_failed: "Outlier",
  analysis: "Signal",
  analysis_failed: "Signal",
  trend: "Outlier",
  repurpose: "Outlier",
};

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
    <>
      {NOTIFICATION_CATEGORIES.map((cat) => (
        <SettingsRow
          key={cat.key}
          label={cat.label}
          action={<Switch checked={!disabled.has(cat.key)} onChange={() => toggle(cat.key)} label={cat.label} disabled={pending === cat.key} />}
        >
          <small>{PRODUCT[cat.key]}</small>
        </SettingsRow>
      ))}
    </>
  );
}
