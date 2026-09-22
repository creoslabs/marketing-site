"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Creator } from "../data";
import { Avatar, EmptyState, Sparkline, ThinHistoryPill } from "../components";
import { AddCreatorButton, RemoveCreatorButton } from "../creator-actions";
import { formatCompact } from "../format";

const COLUMNS = "1fr 96px 82px 74px 74px 92px 84px 64px";

type SortValue = "recent" | "best" | "above2x" | "trend" | "median";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "best", label: "Best score" },
  { value: "above2x", label: "Most above 2×" },
  { value: "trend", label: "Fastest growing" },
  { value: "median", label: "Highest median" },
];

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);
  return ref;
}

function SortDropdown({ current, onChange }: { current: SortValue; onChange: (value: SortValue) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const label = SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Recently added";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
        style={{ padding: "9px 12px" }}
      >
        {label} ▾
      </button>
      {open && (
        <div className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+6px)] z-20 w-[180px] p-[6px]">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="ws-row-hover w-full rounded-[6px] px-[10px] py-[8px] text-left text-[12.5px] font-medium"
              style={{ color: o.value === current ? "var(--ws-accent-text)" : "var(--ws-ink)" }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreatorsTable({ creators: allCreators }: { creators: Creator[] }) {
  const [sort, setSort] = useState<SortValue>("recent");
  const [search, setSearch] = useState("");

  const handleCount = allCreators.reduce((sum, creator) => sum + creator.handles.length, 0);
  const thinCount = allCreators.filter((creator) => creator.handles.some((h) => h.thin)).length;

  const creators = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? allCreators.filter(
          (c) =>
            c.displayName.toLowerCase().includes(query) ||
            c.handles.some((h) => h.handle.toLowerCase().includes(query))
        )
      : allCreators;

    if (sort === "recent") return filtered;

    // Every field sorted on here is already a ratio/percentage relative to
    // each creator's own history (bestScore, hitsAbove2x, medianTrend), not
    // a raw view count — that's what makes comparing them across creators
    // of very different sizes a fair benchmark instead of just "who's
    // biggest". medianTrend is null for creators with too little history to
    // trust a trend; those sort last rather than reading as "worst".
    return [...filtered].sort((a, b) => {
      if (sort === "best") return b.bestScore - a.bestScore;
      if (sort === "above2x") return b.hitsAbove2x - a.hitsAbove2x;
      if (sort === "median") return b.median - a.median;
      if (a.medianTrend === null) return 1;
      if (b.medianTrend === null) return -1;
      return b.medianTrend - a.medianTrend;
    });
  }, [allCreators, sort, search]);

  const isRanked = sort !== "recent";

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            Creators
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            {allCreators.length} tracked · {handleCount} handles · {thinCount} with thin history
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators…"
            className="rounded-[8px] text-[12.5px] outline-none"
            style={{
              width: 220,
              padding: "9px 12px",
              background: "var(--ws-surface)",
              border: "1px solid var(--ws-hairline)",
              color: "var(--ws-ink)",
            }}
          />
          <SortDropdown current={sort} onChange={setSort} />
          <AddCreatorButton className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "9px 12px" }}>
            + Add creator
          </AddCreatorButton>
        </div>
      </div>

      {allCreators.length === 0 ? (
        <div className="ws-card mt-[18px]">
          <EmptyState
            size="large"
            title="You're not tracking anyone yet"
            description="Add a creator by handle and Outlier starts scoring their posts against their own median."
          />
        </div>
      ) : creators.length === 0 ? (
        <div className="ws-card mt-[18px]">
          <EmptyState size="large" title="No creators match that search" />
        </div>
      ) : (
        <div className="mt-[18px] overflow-x-auto">
          <div className="ws-stack" style={{ width: "max-content", minWidth: "100%" }}>
            <div
              className="grid items-center"
              style={{
                gridTemplateColumns: COLUMNS,
                gap: 14,
                padding: "11px 16px",
                background: "var(--ws-surface-header)",
              }}
            >
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>CREATOR</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>MEDIAN</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>BEST 30D</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>ABOVE 2×</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>CADENCE</span>
              <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>TREND</span>
              <span></span>
              <span></span>
            </div>

            {creators.map((creator, i) => {
              const isThin = creator.handles.some((h) => h.thin);
              return (
                <div
                  key={creator.id}
                  className="ws-row-hover grid items-center"
                  style={{ gridTemplateColumns: COLUMNS, gap: 14, padding: "13px 16px" }}
                >
                  <div className="flex min-w-0 items-center gap-[10px]">
                    {isRanked && (
                      <span
                        className="ws-tabular shrink-0 text-[11.5px] font-semibold"
                        style={{ width: 16, color: i < 3 ? "var(--ws-accent-text)" : "var(--ws-ink-45)" }}
                      >
                        {i + 1}
                      </span>
                    )}
                    <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={30} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-[7px]">
                        <span className="truncate text-[13px] font-medium" style={{ color: "var(--ws-ink)" }}>
                          {creator.displayName}
                        </span>
                        {isThin && <ThinHistoryPill />}
                      </div>
                      <p className="truncate text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                        {creator.handles.map((h) => `${h.platform} ${h.handle}`).join(" · ")}
                      </p>
                    </div>
                  </div>

                  <span className="ws-tabular text-[14px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {formatCompact(creator.median)}
                  </span>

                  <span className="ws-tabular text-[15px] font-semibold" style={{ color: "var(--ws-accent-text)" }}>
                    {creator.bestScore.toFixed(1)}×
                  </span>

                  <span className="ws-tabular text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {creator.hitsAbove2x}
                  </span>

                  <span className="text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                    {creator.cadence}
                  </span>

                  <div className="flex items-center gap-[8px]">
                    <Sparkline values={creator.spark} trend={creator.medianTrend} />
                    <span
                      className="ws-tabular text-[11.5px] font-medium"
                      style={{
                        color:
                          creator.medianTrend === null
                            ? "var(--ws-ink-45)"
                            : creator.medianTrend >= 0
                              ? "var(--ws-accent-text)"
                              : "var(--ws-warn-text)",
                      }}
                    >
                      {creator.medianTrend === null
                        ? "—"
                        : `${creator.medianTrend >= 0 ? "+" : ""}${creator.medianTrend}%`}
                    </span>
                  </div>

                  <Link
                    href={`/outlier/creators/${creator.id}`}
                    className="ws-btn-ghost justify-self-start rounded-[7px] text-[11.5px] font-medium"
                    style={{ padding: "7px 10px" }}
                  >
                    Open
                  </Link>

                  <RemoveCreatorButton creatorId={creator.id} handle={creator.handles[0].handle} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
