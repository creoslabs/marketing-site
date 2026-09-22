import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssetDetail } from "../live-data";
import { VerdictLabel } from "../components";

export const metadata: Metadata = {
  title: "Compare — Signal",
  robots: { index: false, follow: false },
};

const MAX_COMPARE = 4;

export default async function ComparePage(props: PageProps<"/signal/compare">) {
  const { ids: idsParam } = await props.searchParams;
  const ids = (typeof idsParam === "string" ? idsParam.split(",") : []).filter(Boolean).slice(0, MAX_COMPARE);
  if (ids.length < 2) notFound();

  const details = await Promise.all(ids.map((id) => getAssetDetail(id)));
  if (details.some((d) => !d)) notFound();
  const assets = details as NonNullable<(typeof details)[number]>[];
  if (new Set(assets.map((a) => a.asset.format)).size > 1) notFound();

  const names = [...new Set(assets.flatMap((a) => a.criteria.map((c) => c.name)))];
  const columns = `1.2fr repeat(${assets.length}, 1fr)`;

  return (
    <div className="ws-page-in" style={{ padding: "26px 22px" }}>
      <Link href="/signal" className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
        ← Library
      </Link>
      <h1 className="mt-[10px] text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
        Compare
      </h1>
      <p className="mt-2 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
        Only the criteria they share, shown side by side — scores are never blended across assets.
      </p>

      <div
        className="mt-[20px] grid grid-cols-1 gap-[14px]"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))` }}
      >
        {assets.map((detail) => (
          <Link key={detail.asset.id} href={`/signal/report/${detail.asset.id}`} className="ws-card block" style={{ padding: "16px 18px" }}>
            <p className="truncate text-[13.5px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              {detail.asset.filename}
            </p>
            <p className="ws-tabular mt-[6px] text-[26px] font-bold" style={{ color: "var(--ws-ink)" }}>
              {detail.asset.score}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-[18px] overflow-x-auto">
        <div className="ws-stack" style={{ minWidth: 280 + assets.length * 160 }}>
          <div className="grid items-center" style={{ gridTemplateColumns: columns, gap: 14, padding: "11px 16px", background: "var(--ws-surface-header)" }}>
            <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>
              CRITERION
            </span>
            {assets.map((detail) => (
              <span key={detail.asset.id} className="ws-eyebrow truncate" style={{ color: "var(--ws-ink-45)" }}>
                {detail.asset.filename}
              </span>
            ))}
          </div>
          {names.map((name) => {
            const cells = assets.map((detail) => detail.criteria.find((c) => c.name === name));
            const verdicts = new Set(cells.filter(Boolean).map((c) => c!.verdict));
            const differs = verdicts.size > 1;
            return (
              <div
                key={name}
                className="grid items-start"
                style={{ gridTemplateColumns: columns, gap: 14, padding: "12px 16px", background: differs ? "var(--ws-warn-tint)" : undefined }}
              >
                <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                  {name}
                </span>
                {cells.map((c, i) => (
                  <div key={assets[i].asset.id}>
                    {c ? (
                      <>
                        <VerdictLabel verdict={c.verdict} />
                        <p className="mt-[3px] text-[11px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
                          {c.evidence}
                        </p>
                      </>
                    ) : (
                      <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                        —
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
