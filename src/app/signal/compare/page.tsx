import type { Metadata } from "next";
import { getAssetDetail, getLibrary } from "../live-data";
import { AssetPicker, ExportCompareButton, SwapButton } from "./compare-controls";
import { AppMain, Button, Card, Chip, PageHeader, appStyles as s, statusEmoji, type StatusKind } from "@/components/app/ui";
import { MediaTile } from "@/components/app/media";
import { EmptyState } from "@/components/ws-empty-state";

export const metadata: Metadata = {
  title: "Compare — Signal",
  robots: { index: false, follow: false },
};

const MAX_COMPARE = 4;

export default async function ComparePage(props: PageProps<"/signal/compare">) {
  const { ids: idsParam } = await props.searchParams;
  const requested = (typeof idsParam === "string" ? idsParam.split(",") : []).filter(Boolean).slice(0, MAX_COMPARE);

  const { assets: library } = await getLibrary();
  const byId = new Map(library.map((a) => [a.id, a]));

  // Same format only: the first asset decides the format. With no (or invalid)
  // selection, default to the two most recent assets of the newest asset's format.
  const lead = requested.map((id) => byId.get(id)).find(Boolean) ?? library[0];
  const format = lead?.format;
  const sameFormat = library.filter((a) => a.format === format);
  let ids = requested.filter((id) => byId.get(id)?.format === format);
  if (ids.length < 2) ids = sameFormat.slice(0, 2).map((a) => a.id);

  if (!format || ids.length < 2) {
    return (
      <AppMain>
        <PageHeader eyebrow="04 / Compare" line1="Compare two assets." line2="Same format only." sub="Only criteria both assets were scored on are shown." />
        <EmptyState
          size="large"
          emoji="⚖️"
          title="You need two assets of the same format"
          description="Analyse at least two videos or two statics, then compare their results side by side."
          action={
            <Button variant="primary" icon="upload" href="/signal/analyze">
              Analyse
            </Button>
          }
        />
      </AppMain>
    );
  }

  const details = (await Promise.all(ids.map((id) => getAssetDetail(id)))).filter((d): d is NonNullable<typeof d> => Boolean(d));
  if (details.length < 2) {
    return (
      <AppMain>
        <PageHeader eyebrow="04 / Compare" line1="Compare two assets." line2="Same format only." />
        <EmptyState size="large" emoji="⚖️" title="Couldn’t load those assets" description="Pick two from the Library to compare." action={<Button variant="primary" href="/signal">Go to Library</Button>} />
      </AppMain>
    );
  }
  const shownIds = details.map((d) => d.asset.id);

  // Only criteria every selected asset was scored on.
  const shared = details[0].criteria.filter((c) => details.every((d) => d.criteria.some((x) => x.name === c.name)));
  const rows = shared.map((c) => {
    const cells = details.map((d) => d.criteria.find((x) => x.name === c.name)!);
    return { name: c.name, tier: c.tier, cells, differs: new Set(cells.map((x) => x.verdict)).size > 1 };
  });
  const differing = rows.filter((r) => r.differs).length;
  const bothFail = rows.filter((r) => r.cells.every((x) => x.verdict === "fail")).map((r) => r.name);
  const ranked = [...details].sort((a, b) => b.asset.score - a.asset.score);
  const [top, runnerUp] = ranked;
  const gap = Math.round(top.asset.score - runnerUp.asset.score);
  const summary = gap === 0 ? `${top.asset.filename} and ${runnerUp.asset.filename} score the same.` : `${top.asset.filename} scores ${gap} point${gap === 1 ? "" : "s"} higher than ${runnerUp.asset.filename}.`;
  const options = sameFormat.map((a) => ({ id: a.id, filename: a.filename, score: a.score }));

  const csv = [
    ["Criterion", "Tier", ...details.map((d) => d.asset.filename)],
    ...rows.map((r) => [r.name, `Tier ${r.tier}`, ...r.cells.map((x) => x.verdict)]),
  ];

  return (
    <AppMain>
      <PageHeader
        eyebrow="04 / Compare"
        line1={`Compare ${details.length === 2 ? "two" : details.length} assets.`}
        line2="Same format only."
        sub="Only criteria both assets were scored on are shown. Video vs static comparisons aren’t possible — the criteria sets don’t overlap enough to be fair."
        actions={
          <>
            {details.length === 2 && <SwapButton ids={shownIds} />}
            <ExportCompareButton rows={csv} filename="signal-compare.csv" />
          </>
        }
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
        {details.map((d, i) => {
          const winner = d.asset.id === top.asset.id && gap > 0;
          return (
            <Card key={d.asset.id} ring={winner} style={{ flex: "1 1 360px", padding: 20 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 90, flex: "none" }}>
                  <MediaTile src={d.asset.assetUrl ?? d.frames?.[0]?.url} height={150} emoji={d.asset.format === "video" ? "🎬" : "🖼️"} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  <AssetPicker current={d.asset.id} position={i} ids={shownIds} options={options} />
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span className={s.disp} style={{ fontSize: 56, letterSpacing: "-0.05em", lineHeight: 0.85, color: winner ? "var(--ws-accent)" : undefined }}>
                      {Math.round(d.asset.score)}
                    </span>
                    <span style={{ color: "var(--ws-ink-45)" }}>/100</span>
                  </div>
                  <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>
                    {d.asset.format === "video" ? "9:16 video" : "Static"} · {d.asset.platforms.join(" + ")}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card paper ring style={{ padding: 22 }}>
        <span className={s.mono} style={{ fontSize: 10, color: "#55534d" }}>
          What separates them
        </span>
        <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>{summary}</span>
        <span style={{ fontSize: 14, color: "#46443f" }}>
          {differing} of {rows.length} shared check{rows.length === 1 ? "" : "s"} differ.
          {bothFail.length > 0 ? ` Both fail ${bothFail.slice(0, 2).join(" and ").toLowerCase()}${bothFail.length > 2 ? ` and ${bothFail.length - 2} more` : ""}.` : ""}
        </span>
      </Card>

      {rows.length === 0 ? (
        <EmptyState size="large" emoji="⚖️" title="No shared criteria" description="These assets weren’t scored on any of the same checks." />
      ) : (
        <div style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-hairline)", borderRadius: 20, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--ws-ink)", minWidth: 520 }}>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "left", padding: "14px 18px", fontWeight: 500 }}>
                  <span className={s.mono} style={{ fontSize: 10, color: "var(--ws-ink-45)" }}>
                    Shared criterion
                  </span>
                </th>
                {details.map((d) => (
                  <th key={d.asset.id} scope="col" style={{ textAlign: "left", padding: "14px 18px", fontWeight: 500 }}>
                    <span className={s.mono} style={{ fontSize: 10, color: "var(--ws-ink-45)" }}>
                      {d.asset.filename}
                    </span>
                  </th>
                ))}
                <th scope="col" style={{ padding: "14px 18px" }}>
                  <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Differs</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} style={{ borderTop: "1px solid var(--ws-hairline)", background: r.differs ? "var(--ws-surface-header)" : undefined }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                      <span style={{ fontSize: 12, color: "var(--ws-ink-45)" }}>Tier {r.tier}</span>
                    </div>
                  </td>
                  {r.cells.map((c, i) => (
                    <td key={i} style={{ padding: "14px 18px" }} title={c.evidence}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: c.verdict === "fail" ? "var(--ws-warn)" : c.verdict === "partial" ? "var(--ws-ink)" : "var(--ws-ink-45)", textTransform: "capitalize" }}>
                        <span className={s.emo} style={{ fontSize: 13 }} aria-hidden="true">
                          {statusEmoji(c.verdict as StatusKind)}
                        </span>
                        {c.verdict}
                      </span>
                    </td>
                  ))}
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>{r.differs && <Chip variant="accent">Differs</Chip>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppMain>
  );
}
