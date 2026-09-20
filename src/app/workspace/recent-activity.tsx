import type { ReactNode } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ws-empty-state";
import { relativeTime } from "@/lib/relative-time";

export type ActivityItem = {
  id: string;
  icon: ReactNode;
  accentColor: string;
  text: string;
  meta: string;
  timestampIso: string;
  href: string;
};

// A flat, chronological list rather than another card — built around a
// plain ActivityItem shape so a future Creos product only needs to push its
// own items into the same array, not touch this component.
export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div>
        <p className="ws-eyebrow" style={{ marginBottom: 14 }}>
          Recent
        </p>
        <EmptyState title="Nothing yet" description="Activity across your tools will show up here." />
      </div>
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
  );

  return (
    <div>
      <p className="ws-eyebrow" style={{ marginBottom: 14 }}>
        Recent
      </p>
      <div className="flex flex-col">
        {sorted.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="ws-row-hover flex items-center gap-[12px] rounded-[8px]"
            style={{ padding: "10px 10px" }}
          >
            <span
              className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full"
              style={{ color: item.accentColor, background: "var(--ws-surface-header)" }}
            >
              {item.icon}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px]" style={{ color: "var(--ws-ink)" }}>
              {item.text}
              <span style={{ color: "var(--ws-ink-45)" }}> · {item.meta}</span>
            </span>
            <span className="shrink-0 text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
              {relativeTime(item.timestampIso)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
