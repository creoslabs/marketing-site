"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Asset, Platform } from "./data";
import { ScoreBadge, IssuePill, Thumb } from "./components";
import { DeleteAssetButton } from "./delete-asset-button";

type Row = { asset: Asset; percentile: number | null };
type SortValue = "recent" | "score-desc" | "score-asc" | "issues";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "score-desc", label: "Highest score" },
  { value: "score-asc", label: "Lowest score" },
  { value: "issues", label: "Most issues" },
];

const ALL_PLATFORMS: Platform[] = ["TikTok", "Meta"];

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
  const label = SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Most recent";

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium" style={{ padding: "9px 12px" }}>
        {label} ▾
      </button>
      {open && (
        <div className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+6px)] z-20 w-[170px] p-[6px]">
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

function FiltersDropdown({
  platformFilter,
  onPlatformChange,
  failingOnly,
  onFailingOnlyChange,
}: {
  platformFilter: Platform | "all";
  onPlatformChange: (value: Platform | "all") => void;
  failingOnly: boolean;
  onFailingOnlyChange: (value: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const activeCount = (platformFilter !== "all" ? 1 : 0) + (failingOnly ? 1 : 0);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium" style={{ padding: "9px 12px" }}>
        Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
      </button>
      {open && (
        <div className="ws-card ws-dropdown-in absolute right-0 top-[calc(100%+6px)] z-20 w-[190px] p-[6px]">
          <p className="ws-eyebrow px-[10px] pb-[6px] pt-[4px]">Platform</p>
          {(["all", ...ALL_PLATFORMS] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPlatformChange(p)}
              className="ws-row-hover w-full rounded-[6px] px-[10px] py-[8px] text-left text-[12.5px] font-medium"
              style={{ color: platformFilter === p ? "var(--ws-accent-text)" : "var(--ws-ink)" }}
            >
              {p === "all" ? "All platforms" : p}
            </button>
          ))}
          <div className="my-[4px] h-px" style={{ background: "var(--ws-hairline)" }} />
          <button
            type="button"
            onClick={() => onFailingOnlyChange(!failingOnly)}
            className="ws-row-hover w-full rounded-[6px] px-[10px] py-[8px] text-left text-[12.5px] font-medium"
            style={{ color: failingOnly ? "var(--ws-accent-text)" : "var(--ws-ink)" }}
          >
            {failingOnly ? "✓ " : ""}Failing checks only
          </button>
        </div>
      )}
    </div>
  );
}

function ordinalSuffix(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function AssetCard({ asset, percentile }: { asset: Asset; percentile: number | null }) {
  const card = (
    <>
      <div className="group">
        <Thumb
          aspectRatio={asset.format === "video" ? "9/16" : "4/5"}
          radius={10}
          style={{ border: "1px solid var(--ws-hairline)", transition: "border-color 0.15s ease" }}
          className="group-hover:[border-color:var(--ws-hairline-strong)]"
        >
          {asset.assetUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- a signed Supabase Storage URL, not a static asset next/image can optimize
            <img
              src={asset.assetUrl}
              alt={asset.filename}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          )}
          {asset.assetUrl && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[64px]"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.45), transparent)" }}
            />
          )}
          <div className="absolute left-[10px] top-[10px]" style={{ zIndex: 2 }}>
            <ScoreBadge score={asset.score} format={asset.format} />
          </div>
          {asset.issuePill && (
            <div className="absolute bottom-[10px] left-[10px]" style={{ zIndex: 2 }}>
              <IssuePill>{asset.issuePill}</IssuePill>
            </div>
          )}
        </Thumb>
      </div>
      <div className="mt-[10px]">
        <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
          {asset.filename}
        </p>
        <p className="mt-[3px] text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
          {asset.postedAt} ·{" "}
          {percentile === null ? `first ${asset.format}` : `${percentile}${ordinalSuffix(percentile)} of ${asset.format}s`}
        </p>
      </div>
    </>
  );

  return (
    <div className="group relative">
      <Link href={`/signal/report/${asset.id}`} className="block">
        {card}
      </Link>
      <DeleteAssetButton assetId={asset.id} filename={asset.filename} />
    </div>
  );
}

function AssetSection({ title, rows, median }: { title: string; rows: Row[]; median: number }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-[24px] first:mt-[18px]">
      <div className="flex items-baseline gap-[10px]">
        <p className="ws-eyebrow">{title}</p>
        <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
          {rows.length} · median {median}
        </span>
      </div>
      <div className="mt-[12px] grid items-start gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fill, 110px)" }}>
        {rows.map(({ asset, percentile }) => (
          <AssetCard key={asset.id} asset={asset} percentile={percentile} />
        ))}
      </div>
    </div>
  );
}

export function LibraryGrid({ rows, medians }: { rows: Row[]; medians: { video: number; static: number } }) {
  const total = rows.length;
  const [sort, setSort] = useState<SortValue>("recent");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [failingOnly, setFailingOnly] = useState(false);

  const sortedFiltered = useMemo(() => {
    let filtered = rows;
    if (platformFilter !== "all") filtered = filtered.filter((r) => r.asset.platforms.includes(platformFilter));
    if (failingOnly) filtered = filtered.filter((r) => r.asset.failedChecks > 0);

    const sorted = [...filtered];
    switch (sort) {
      case "score-desc":
        sorted.sort((a, b) => b.asset.score - a.asset.score);
        break;
      case "score-asc":
        sorted.sort((a, b) => a.asset.score - b.asset.score);
        break;
      case "issues":
        sorted.sort((a, b) => b.asset.failedChecks - a.asset.failedChecks);
        break;
      case "recent":
      default:
        sorted.sort((a, b) => new Date(b.asset.createdAtIso).getTime() - new Date(a.asset.createdAtIso).getTime());
    }
    return sorted;
  }, [rows, sort, platformFilter, failingOnly]);

  const videoRows = sortedFiltered.filter((r) => r.asset.format === "video");
  const staticRows = sortedFiltered.filter((r) => r.asset.format === "static");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-[16px]">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            Library
          </h1>
          <p className="mt-2 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            {total} assets · statics median {medians.static} · videos median {medians.video}
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <SortDropdown current={sort} onChange={setSort} />
          <FiltersDropdown
            platformFilter={platformFilter}
            onPlatformChange={setPlatformFilter}
            failingOnly={failingOnly}
            onFailingOnlyChange={setFailingOnly}
          />
          <Link href="/signal/analyze" className="ws-btn-primary rounded-[7px] text-[12.5px] font-semibold" style={{ padding: "9px 12px" }}>
            + Analyze
          </Link>
        </div>
      </div>

      {sortedFiltered.length === 0 ? (
        <p className="mt-[24px] text-[13px]" style={{ color: "var(--ws-ink-45)" }}>
          Nothing matches these filters.
        </p>
      ) : (
        <>
          <AssetSection title="VIDEOS" rows={videoRows} median={medians.video} />
          <AssetSection title="STATICS" rows={staticRows} median={medians.static} />
        </>
      )}
    </>
  );
}
