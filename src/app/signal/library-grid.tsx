"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Asset, Format, Platform } from "./data";
import { DeleteAssetButton } from "./delete-asset-button";
import { Button, Card, CardHead, Mono, appStyles as s, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";
import { FilterMenu } from "@/components/app/filter-menu";
import { Switch } from "@/components/app/controls";
import { MediaTile } from "@/components/app/media";
import { EmptyState } from "@/components/ws-empty-state";

type Row = { asset: Asset; percentile: number | null };
type SortValue = "recent" | "score-desc" | "score-asc" | "issues";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "score-desc", label: "Highest score" },
  { value: "score-asc", label: "Lowest score" },
  { value: "issues", label: "Most issues" },
];

const ALL_PLATFORMS: Platform[] = ["TikTok", "Meta"];

function percentileLabel(percentile: number | null, format: Format) {
  if (percentile === null) return `first ${format}`;
  if (percentile < 1) return `Bottom of ${format}s`;
  const j = percentile % 10;
  const k = percentile % 100;
  const suffix = j === 1 && k !== 11 ? "st" : j === 2 && k !== 12 ? "nd" : j === 3 && k !== 13 ? "rd" : "th";
  return `${percentile}${suffix} pct of ${format}s`;
}

function FiltersMenu({
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
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const activeCount = (platformFilter !== "all" ? 1 : 0) + (failingOnly ? 1 : 0);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" className={cx(s.btn, s.btnSm, s.btnGhost)} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>Filters{activeCount > 0 ? ` · ${activeCount}` : ""}</span>
        <Icon name="chevronDown" />
      </button>
      {open && (
        <div className={s.menu} style={{ minWidth: 230 }}>
          <Mono className={s.menuLabel}>Platform</Mono>
          {(["all", ...ALL_PLATFORMS] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={s.menuItem}
              style={platformFilter === p ? { color: "var(--ws-accent)" } : undefined}
              onClick={() => onPlatformChange(p)}
            >
              {p === "all" ? "All platforms" : p}
              {platformFilter === p && <Icon name="check" size={14} />}
            </button>
          ))}
          <div className={s.menuRule} />
          <div className={s.menuItem} style={{ cursor: "default" }}>
            <span>Failing checks only</span>
            <Switch checked={failingOnly} onChange={onFailingOnlyChange} label="Failing checks only" />
          </div>
        </div>
      )}
    </div>
  );
}

function AssetCard({ row, winner }: { row: Row; winner: boolean }) {
  const { asset, percentile } = row;
  return (
    <div className={s.assetCard}>
      <Link href={`/signal/report/${asset.id}`} className={s.post} style={{ color: "inherit" }}>
        <MediaTile
          src={asset.assetUrl}
          platform={asset.format === "video" ? "9:16 · Video" : "Static"}
          label={asset.platforms[0]}
          score={String(Math.round(asset.score))}
          scoreAccent={winner}
          height={290}
          emoji={asset.format === "video" ? "🎬" : "🖼️"}
          ring={winner}
        />
        <span style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.filename}</span>
        <span style={{ fontSize: 12, color: "var(--ws-ink-45)" }}>
          {asset.postedAt} · {percentileLabel(percentile, asset.format)}
        </span>
        {asset.failedChecks > 0 && <span style={{ fontSize: 12, color: "var(--ws-warn)" }}>❌ {asset.failedChecks} failing check{asset.failedChecks === 1 ? "" : "s"}</span>}
      </Link>
      <DeleteAssetButton assetId={asset.id} filename={asset.filename} />
    </div>
  );
}

export function LibraryGrid({ rows, medians }: { rows: Row[]; medians: { video: number; static: number } }) {
  const [sort, setSort] = useState<SortValue>("recent");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [failingOnly, setFailingOnly] = useState(false);

  const videoCount = rows.filter((r) => r.asset.format === "video").length;
  const staticCount = rows.filter((r) => r.asset.format === "static").length;
  const [format, setFormat] = useState<Format>(videoCount > 0 || staticCount === 0 ? "video" : "static");

  const visible = useMemo(() => {
    let filtered = rows.filter((r) => r.asset.format === format);
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
  }, [rows, format, sort, platformFilter, failingOnly]);

  const topScore = Math.max(...rows.filter((r) => r.asset.format === format).map((r) => r.asset.score), 0);

  return (
    <Card>
      <CardHead
        label={`Library · ${format === "video" ? "videos" : "statics"}`}
        right={
          <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
            Median {format === "video" ? medians.video : medians.static}
          </Mono>
        }
      />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <button type="button" aria-pressed={format === "video"} className={cx(s.mono, s.chip, s.chipButton, format === "video" ? s.chipPaper : s.chipOutline)} onClick={() => setFormat("video")}>
          Video · {videoCount}
        </button>
        <button type="button" aria-pressed={format === "static"} className={cx(s.mono, s.chip, s.chipButton, format === "static" ? s.chipPaper : s.chipOutline)} onClick={() => setFormat("static")}>
          Static · {staticCount}
        </button>
        <span style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <FilterMenu label="Sort" value={sort} options={SORT_OPTIONS} onChange={setSort} align="right" />
          <FiltersMenu platformFilter={platformFilter} onPlatformChange={setPlatformFilter} failingOnly={failingOnly} onFailingOnlyChange={setFailingOnly} />
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState emoji="🔍" title={format === "video" ? (videoCount === 0 ? "No videos analysed yet" : "Nothing matches these filters") : staticCount === 0 ? "No statics analysed yet" : "Nothing matches these filters"} description="Scores are only comparable within a format." action={<Button variant="primary" icon="upload" href="/signal/analyze">Analyse</Button>} />
      ) : (
        <div className={s.assetGrid}>
          {visible.map((row) => (
            <AssetCard key={row.asset.id} row={row} winner={sort !== "score-asc" && row.asset.score === topScore && topScore > 0} />
          ))}
        </div>
      )}
    </Card>
  );
}
