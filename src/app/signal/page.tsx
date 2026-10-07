import type { Metadata } from "next";
import Link from "next/link";
import { getLibrary, medianOf, percentileWithin, getFailureThemes } from "./live-data";
import { LibraryGrid } from "./library-grid";
import { AppMain, Button, PageHeader, Mono, appStyles as s } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";

export const metadata: Metadata = {
  title: "Library — Signal",
  robots: { index: false, follow: false },
};

function countAnalysedThisWeek(assets: { createdAtIso: string }[]) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return assets.filter((a) => new Date(a.createdAtIso).getTime() >= oneWeekAgo).length;
}

function DropCard({ title, body }: { title: string; body?: string }) {
  return (
    <div style={{ border: "1.5px dashed var(--ws-hairline-strong)", borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", background: "var(--ws-surface)" }}>
      <span style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--ws-accent)", color: "var(--ws-accent-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="upload" size={22} />
      </span>
      <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
      <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>{body ?? "Static or video · up to 500 MB"}</span>
      <Button variant="paper" href="/signal/analyze">
        Choose a file
      </Button>
    </div>
  );
}

export default async function LibraryPage() {
  // Independent reads — fetched together instead of one after another. The
  // extra failureThemes query is wasted in the rare empty-library case below,
  // but that's cheaper than making every normal page load wait for two
  // sequential round-trips.
  const [live, failureThemes] = await Promise.all([getLibrary(), getFailureThemes()]);
  const assets = live.assets;
  const isLive = live.isLive;

  const medians = {
    static: medianOf(assets.filter((a) => a.format === "static").map((a) => a.score)),
    video: medianOf(assets.filter((a) => a.format === "video").map((a) => a.score)),
  };

  if (assets.length === 0) {
    return (
      <AppMain>
        <PageHeader eyebrow="02 / Library" line1="Nothing analysed yet." sub="Statics and videos have separate medians. Scores are only comparable within a format." />
        <div style={{ maxWidth: 480 }}>
          <DropCard
            title={isLive ? "Analyse your first asset" : "Signal isn’t connected to a database yet"}
            body={isLive ? "Drop a static or video ad to get its first best-practice score — up to 500 MB." : "Analysis results will show up here once it is."}
          />
        </div>
      </AppMain>
    );
  }

  const rows = assets.map((asset) => ({ asset, percentile: percentileWithin(asset.score, asset.format, assets) }));
  const topTheme = failureThemes[0] ?? null;
  const analysedThisWeek = countAnalysedThisWeek(assets);

  return (
    <AppMain>
      <PageHeader
        eyebrow="02 / Library"
        line1={`${assets.length} asset${assets.length === 1 ? "" : "s"} scored.`}
        line2={topTheme ? `${topTheme.count} fail “${topTheme.name}.”` : undefined}
        sub="Statics and videos have separate medians. Scores are only comparable within a format."
        actions={
          <>
            <Button variant="ghost" href="/signal/compare">
              Compare
            </Button>
            <Button variant="primary" icon="upload" href="/signal/analyze">
              Analyse
            </Button>
          </>
        }
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "3 1 800px", minWidth: 0 }}>
          <LibraryGrid rows={rows} medians={medians} />
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <DropCard title="Drop an asset to analyse" />

          {topTheme && (
            <div style={{ background: "var(--ws-warn-tint)", border: "1px solid var(--ws-warn-tint-border)", borderRadius: 22, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
              <Mono style={{ fontSize: 10, color: "var(--ws-warn)" }}>Across your library</Mono>
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                {topTheme.count} asset{topTheme.count === 1 ? "" : "s"} fail “{topTheme.name}”.
              </span>
              <span style={{ fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.5 }}>It’s the most common failing check. Fixing it lifts the most scores at once.</span>
              <Link href="/signal/benchmarks" style={{ fontSize: 13, fontWeight: 600 }}>
                See recurring failures →
              </Link>
            </div>
          )}

          <div style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-hairline)", borderRadius: 22, padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            <Mono className={s.cardLabel} style={{ fontSize: 11 }}>
              This week
            </Mono>
            {[
              ["Analysed", `${analysedThisWeek} asset${analysedThisWeek === 1 ? "" : "s"}`],
              ["Statics median", assets.some((a) => a.format === "static") ? medians.static : "—"],
              ["Videos median", assets.some((a) => a.format === "video") ? medians.video : "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--ws-ink-45)" }}>{k}</span>
                <span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppMain>
  );
}
