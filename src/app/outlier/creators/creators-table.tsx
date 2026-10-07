"use client";

import { useMemo, useState } from "react";
import type { Creator, Platform } from "../data";
import { AddCreatorButton, CreatorRowMenu } from "../creator-actions";
import { formatCompact } from "../format";
import { AppMain, Avatar, Button, Chip, PageHeader, appStyles as s, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";
import { FilterMenu } from "@/components/app/filter-menu";
import { EmptyState } from "@/components/ws-empty-state";

const ALL_PLATFORMS: Platform[] = ["TT", "IG", "YT"];
const PLATFORM_LABEL: Record<Platform, string> = { TT: "TikTok", IG: "Instagram", YT: "YouTube" };

type SortValue = "recent" | "best" | "above2x" | "trend" | "median";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "best", label: "Best score" },
  { value: "above2x", label: "Most above 2×" },
  { value: "trend", label: "Fastest growing" },
  { value: "median", label: "Highest median" },
];

function Spark({ values, trend }: { values: number[]; trend: number | null }) {
  const max = Math.max(...values, 1);
  const last = values.length - 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28, width: 84 }} aria-hidden="true">
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(16, (v / max) * 100)}%`,
            borderRadius: 1,
            background: i === last && trend !== null ? (trend >= 0 ? "var(--ws-accent)" : "var(--ws-grey)") : "var(--ws-hairline-strong)",
          }}
        />
      ))}
    </div>
  );
}

const th: React.CSSProperties = { padding: "14px 16px", fontWeight: 500 };

export function CreatorsTable({ creators: allCreators }: { creators: Creator[] }) {
  const [sort, setSort] = useState<SortValue>("recent");
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);
  const [thinOnly, setThinOnly] = useState(false);

  const handleCount = allCreators.reduce((sum, creator) => sum + creator.handles.length, 0);
  const thinCount = allCreators.filter((creator) => creator.handles.some((h) => h.thin)).length;
  const platformsPresent = useMemo(() => ALL_PLATFORMS.filter((p) => allCreators.some((c) => c.handles.some((h) => h.platform === p))), [allCreators]);

  const creators = useMemo(() => {
    const query = search.trim().toLowerCase();
    let filtered = query
      ? allCreators.filter((c) => c.displayName.toLowerCase().includes(query) || c.handles.some((h) => h.handle.toLowerCase().includes(query)))
      : allCreators;

    if (platformFilter) filtered = filtered.filter((c) => c.handles.some((h) => h.platform === platformFilter));
    if (thinOnly) filtered = filtered.filter((c) => c.handles.some((h) => h.thin));

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
  }, [allCreators, sort, search, platformFilter, thinOnly]);

  const isRanked = sort !== "recent";
  const noFilters = !platformFilter && !thinOnly;

  return (
    <AppMain>
      <PageHeader
        eyebrow="04 / Creators"
        line1="Who you’re"
        line2="watching."
        sub={`${allCreators.length} creator${allCreators.length === 1 ? "" : "s"} · ${handleCount} handle${handleCount === 1 ? "" : "s"} · ${thinCount} with thin history.`}
        actions={<AddCreatorButton variant="primary" />}
      />

      {allCreators.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              height: 40,
              width: 280,
              maxWidth: "100%",
              padding: "0 14px",
              borderRadius: 999,
              border: "1px solid var(--ws-hairline-strong)",
              background: "var(--ws-surface)",
              color: "var(--ws-ink-45)",
            }}
          >
            <Icon name="searchGlass" />
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Search creators</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators"
              style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", color: "var(--ws-ink)", font: "inherit", fontSize: 14, outline: "none" }}
            />
          </label>
          <FilterMenu label="Sort" value={sort} options={SORT_OPTIONS} onChange={setSort} />
          <button
            type="button"
            aria-pressed={noFilters}
            className={cx(s.mono, s.chip, s.chipButton, noFilters ? s.chipPaper : s.chipOutline)}
            onClick={() => {
              setPlatformFilter(null);
              setThinOnly(false);
            }}
          >
            All · {allCreators.length}
          </button>
          {platformsPresent.length > 1 &&
            platformsPresent.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={platformFilter === p}
                className={cx(s.mono, s.chip, s.chipButton, platformFilter === p ? s.chipPaper : s.chipOutline)}
                onClick={() => setPlatformFilter((prev) => (prev === p ? null : p))}
              >
                {PLATFORM_LABEL[p]}
              </button>
            ))}
          {thinCount > 0 && (
            <button
              type="button"
              aria-pressed={thinOnly}
              className={cx(s.mono, s.chip, s.chipButton, thinOnly ? s.chipPaper : s.chipOutline)}
              onClick={() => setThinOnly((v) => !v)}
            >
              Thin history · {thinCount}
            </button>
          )}
        </div>
      )}

      {allCreators.length === 0 ? (
        <EmptyState
          size="large"
          emoji="🔭"
          title="You’re not tracking anyone yet"
          description="Add a creator by handle and Outlier starts scoring their posts against their own median."
          action={<AddCreatorButton variant="primary" />}
        />
      ) : creators.length === 0 ? (
        <EmptyState size="large" emoji="🔍" title="No creators match these filters" />
      ) : (
        <div style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-hairline)", borderRadius: 20, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--ws-ink)", minWidth: 860 }}>
            <thead>
              <tr>
                {[
                  ["Creator", "left"],
                  ["Platforms", "left"],
                  ["Median views", "right"],
                  ["Best 30D", "right"],
                  ["Above 2×", "right"],
                  ["Cadence", "right"],
                  ["Trend", "left"],
                  ["", "right"],
                ].map(([label, align], i) => (
                  <th key={i} scope="col" style={{ ...th, textAlign: align as "left" | "right" }}>
                    <span className={s.mono} style={{ fontSize: 10, color: "var(--ws-ink-45)" }}>
                      {label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creators.map((creator, i) => {
                const isThin = creator.handles.some((h) => h.thin);
                const trend = creator.medianTrend;
                return (
                  <tr key={creator.id} style={{ borderTop: "1px solid var(--ws-hairline)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {isRanked && (
                          <span className={s.tabular} style={{ width: 16, fontSize: 12, fontWeight: 700, color: i < 3 ? "var(--ws-accent)" : "var(--ws-ink-45)" }}>
                            {i + 1}
                          </span>
                        )}
                        <Avatar initials={creator.initials} src={creator.avatarUrl} size={36} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                          <span style={{ fontSize: 15, fontWeight: 700 }}>{creator.displayName}</span>
                          {isThin ? <Chip variant="fail" className="">Thin history</Chip> : <span style={{ fontSize: 12, color: "var(--ws-ink-45)" }}>{creator.handles.map((h) => `@${h.handle}`).join(" · ")}</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {creator.handles.map((h) => (
                          <Chip key={h.id} variant="soft">
                            {h.platform}
                          </Chip>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 15 }} className={s.tabular}>
                      {formatCompact(creator.median)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <span className={s.disp} style={{ fontSize: 18, color: "var(--ws-accent)" }}>
                        {creator.bestScore.toFixed(1)}×
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 15 }} className={s.tabular}>
                      {creator.hitsAbove2x}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, color: "var(--ws-ink-60)" }}>{creator.cadence}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Spark values={creator.spark} trend={trend} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: trend === null || trend < 0 ? "var(--ws-ink-45)" : "var(--ws-ink)" }}>
                          {trend === null ? "—" : `${trend >= 0 ? "+" : "−"}${Math.abs(trend)}%`}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <Button variant="ghost" size="sm" href={`/outlier/creators/${creator.id}`}>
                          Open
                        </Button>
                        <CreatorRowMenu creatorId={creator.id} handle={creator.handles[0].handle} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppMain>
  );
}
