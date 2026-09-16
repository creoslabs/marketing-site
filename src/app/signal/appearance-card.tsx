"use client";

import { useWsTheme, type ThemePreference } from "@/components/ws-theme";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function AppearanceCard() {
  const [preference, setTheme] = useWsTheme();

  return (
    <div className="ws-card" style={{ padding: "16px 18px 18px" }}>
      <p className="ws-eyebrow">APPEARANCE</p>
      <div className="mt-[12px] flex rounded-[8px] p-[3px]" style={{ border: "1px solid var(--ws-hairline)" }}>
        {OPTIONS.map((option) => {
          const active = preference === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className="flex-1 rounded-[6px] text-[11.5px] font-medium transition-colors"
              style={{
                padding: "7px 0",
                background: active ? "var(--ws-accent)" : "transparent",
                color: active ? "var(--ws-accent-ink)" : "var(--ws-ink-60)",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-[10px] text-[11px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
        Asset thumbnails and safe-zone overlays never invert — you&apos;re judging real creative.
      </p>
    </div>
  );
}
