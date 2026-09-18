import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssetDetail } from "../live-data";
import { VerdictLabel } from "../components";

export const metadata: Metadata = {
  title: "Compare — Signal",
  robots: { index: false, follow: false },
};

export default async function ComparePage(props: PageProps<"/signal/compare">) {
  const { a, b } = await props.searchParams;
  const idA = typeof a === "string" ? a : undefined;
  const idB = typeof b === "string" ? b : undefined;
  if (!idA || !idB) notFound();

  const [assetA, assetB] = await Promise.all([getAssetDetail(idA), getAssetDetail(idB)]);
  if (!assetA || !assetB) notFound();
  if (assetA.asset.format !== assetB.asset.format) notFound();

  const names = [...new Set([...assetA.criteria.map((c) => c.name), ...assetB.criteria.map((c) => c.name)])];

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

      <div className="mt-[20px] grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        {[assetA, assetB].map((detail) => (
          <Link
            key={detail.asset.id}
            href={`/signal/report/${detail.asset.id}`}
            className="ws-card block"
            style={{ padding: "16px 18px" }}
          >
            <p className="truncate text-[13.5px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              {detail.asset.filename}
            </p>
            <p className="ws-tabular mt-[6px] text-[26px] font-bold" style={{ color: "var(--ws-ink)" }}>
              {detail.asset.score}
            </p>
          </Link>
        ))}
      </div>

      <div className="ws-stack mt-[18px]">
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "1.2fr 1fr 1fr", gap: 14, padding: "11px 16px", background: "var(--ws-surface-header)" }}
        >
          <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>
            CRITERION
          </span>
          <span className="ws-eyebrow truncate" style={{ color: "var(--ws-ink-45)" }}>
            {assetA.asset.filename}
          </span>
          <span className="ws-eyebrow truncate" style={{ color: "var(--ws-ink-45)" }}>
            {assetB.asset.filename}
          </span>
        </div>
        {names.map((name) => {
          const ca = assetA.criteria.find((c) => c.name === name);
          const cb = assetB.criteria.find((c) => c.name === name);
          const differs = Boolean(ca && cb && ca.verdict !== cb.verdict);
          return (
            <div
              key={name}
              className="grid items-start"
              style={{
                gridTemplateColumns: "1.2fr 1fr 1fr",
                gap: 14,
                padding: "12px 16px",
                background: differs ? "var(--ws-warn-tint)" : undefined,
              }}
            >
              <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                {name}
              </span>
              <div>
                {ca ? (
                  <>
                    <VerdictLabel verdict={ca.verdict} />
                    <p className="mt-[3px] text-[11px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
                      {ca.evidence}
                    </p>
                  </>
                ) : (
                  <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                    —
                  </span>
                )}
              </div>
              <div>
                {cb ? (
                  <>
                    <VerdictLabel verdict={cb.verdict} />
                    <p className="mt-[3px] text-[11px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
                      {cb.evidence}
                    </p>
                  </>
                ) : (
                  <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
