import type { Metadata } from "next";
import Link from "next/link";
import { getCreators } from "../live-data";
import { Avatar, EmptyState, Sparkline, ThinHistoryPill } from "../components";
import { AddCreatorButton, RemoveCreatorButton } from "../creator-actions";
import { formatCompact } from "../format";

export const metadata: Metadata = {
  title: "Creators — Outlier",
  robots: { index: false, follow: false },
};

const COLUMNS = "1fr 96px 82px 74px 74px 92px 84px 64px";

export default async function CreatorsPage() {
  const creators = await getCreators();
  const handleCount = creators.reduce((sum, creator) => sum + creator.handles.length, 0);
  const thinCount = creators.filter((creator) => creator.handles.some((h) => h.thin)).length;

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            Creators
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            {creators.length} tracked · {handleCount} handles · {thinCount} with thin history
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <input
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
          <button
            type="button"
            className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
            style={{ padding: "9px 12px" }}
          >
            Best 30d ▾
          </button>
          <AddCreatorButton className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold" style={{ padding: "9px 12px" }}>
            + Add creator
          </AddCreatorButton>
        </div>
      </div>

      {creators.length === 0 ? (
        <div className="ws-card mt-[18px]">
          <EmptyState
            size="large"
            title="You're not tracking anyone yet"
            description="Add a creator by handle and Outlier starts scoring their posts against their own median."
          />
        </div>
      ) : (
      <div className="mt-[18px] ws-stack">
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

        {creators.map((creator) => {
          const isThin = creator.handles.some((h) => h.thin);
          return (
            <div
              key={creator.id}
              className="ws-row-hover grid items-center"
              style={{ gridTemplateColumns: COLUMNS, gap: 14, padding: "13px 16px" }}
            >
              <div className="flex min-w-0 items-center gap-[10px]">
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
      )}
    </div>
  );
}
