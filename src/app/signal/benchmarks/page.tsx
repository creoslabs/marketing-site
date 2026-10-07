import type { Metadata } from "next";
import Link from "next/link";
import type { Asset, FailureStreak, FailureTheme } from "../data";
import { getLibrary, medianOf, computeScoreTrend, getFailureThemes, getRecurringPasses, getFailureStreaks } from "../live-data";
import { AppMain, Button, Card, CardHead, Chip, Mono, PageHeader, appStyles as s } from "@/components/app/ui";

const PLATFORM_SHORT: Record<Asset["platforms"][number], string> = { TikTok: "TT", Meta: "META" };

export const metadata: Metadata = {
  title: "Benchmarks — Signal",
  robots: { index: false, follow: false },
};

function FormatColumn({
  title,
  format,
  assets,
  median,
  platformMedians,
  trend,
}: {
  title: string;
  format: "static" | "video";
  assets: Asset[];
  median: number;
  platformMedians: { platform: Asset["platforms"][number]; median: number }[];
  trend: number | null;
}) {
  const sorted = [...assets].sort((a, b) => b.score - a.score);
  const max = Math.max(...sorted.map((a) => a.score), 1);

  return (
    <Card style={{ flex: "1 1 460px", gap: 14 }}>
      <CardHead
        label={title}
        right={
          <Mono className={s.cardLabel} style={{ fontSize: 10, color: sorted.length > 0 ? "var(--ws-ink)" : undefined }}>
            Median {sorted.length > 0 ? median : "—"}
          </Mono>
        }
      />
      {platformMedians.length > 1 && (
        <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>{platformMedians.map((p) => `${p.platform} median ${p.median}`).join(" · ")}</span>
      )}
      {trend !== null && (
        <span style={{ fontSize: 13, fontWeight: 600, color: trend >= 0 ? "var(--ws-ink)" : "var(--ws-warn)" }}>
          {trend >= 0 ? "+" : "−"}
          {Math.abs(trend)}% vs earlier
        </span>
      )}
      {sorted.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "26px 0", textAlign: "center" }}>
          <span className={s.emo} style={{ fontSize: 30 }} aria-hidden="true">
            {format === "video" ? "🎬" : "🖼️"}
          </span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Nothing analysed in this format yet</span>
          <Button variant="ghost" size="sm" icon="upload" href="/signal/analyze">
            Analyse a {format}
          </Button>
        </div>
      ) : (
        sorted.map((asset, i) => (
          <Link key={asset.id} href={`/signal/report/${asset.id}`} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 44, flex: "none" }}>
              <Chip variant="soft">{PLATFORM_SHORT[asset.platforms[0]]}</Chip>
            </span>
            <span style={{ width: 150, flex: "none", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.filename}</span>
            <div style={{ flex: 1, height: 10, borderRadius: 5, background: "var(--ws-surface-header)" }} aria-hidden="true">
              <div style={{ width: `${(asset.score / max) * 100}%`, height: 10, borderRadius: 5, background: i === 0 ? "var(--ws-accent)" : "var(--ws-grey)" }} />
            </div>
            <span className={s.disp} style={{ width: 34, textAlign: "right", fontSize: 18 }}>
              {Math.round(asset.score)}
            </span>
          </Link>
        ))
      )}
    </Card>
  );
}

// assets arrives most-recent-first (getLibrary orders by created_at desc),
// which is exactly the order computeScoreTrend needs. Grouped by each
// asset's primary platform (platforms[0]) — an asset targeting more than
// one platform is only counted once here, under its primary.
function platformMediansFor(assets: Asset[]) {
  const platforms = [...new Set(assets.map((a) => a.platforms[0]))];
  return platforms.map((platform) => ({
    platform,
    median: medianOf(assets.filter((a) => a.platforms[0] === platform).map((a) => a.score)),
  }));
}

function ThemeList({
  title,
  description,
  themes,
  kind,
  streaks,
}: {
  title: string;
  description: string;
  themes: FailureTheme[];
  kind: "fail" | "pass";
  streaks?: FailureStreak[];
}) {
  return (
    <Card style={{ flex: "1 1 460px", gap: 10 }}>
      <CardHead label={title} />
      <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>{description}</span>
      {streaks && streaks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {streaks.map((st) => (
            <span key={st.name} style={{ fontSize: 13, fontWeight: 600, color: "var(--ws-warn)" }}>
              ⚠️ {st.name} has failed your last {st.streak} uploads in a row
            </span>
          ))}
        </div>
      )}
      <div>
        {themes.map((theme, i) => (
          <div key={theme.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid var(--ws-hairline)" }}>
            <span className={s.emo} style={{ fontSize: 14 }} aria-hidden="true">
              {kind === "fail" ? "❌" : "✅"}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 14 }}>{theme.name}</span>
            <Chip variant="soft">Tier {theme.tier}</Chip>
            <span style={{ width: 84, textAlign: "right", fontSize: 13, fontWeight: 700, color: kind === "fail" ? "var(--ws-warn)" : "var(--ws-ink)" }}>
              {kind === "fail" ? "failed" : "passed"} {theme.count}×
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default async function BenchmarksPage() {
  const [live, failureThemes, recurringPasses, failureStreaks] = await Promise.all([getLibrary(), getFailureThemes(), getRecurringPasses(), getFailureStreaks()]);
  const assets = live.assets;
  const staticAssets = assets.filter((a) => a.format === "static");
  const videoAssets = assets.filter((a) => a.format === "video");
  const medians = {
    static: medianOf(staticAssets.map((a) => a.score)),
    video: medianOf(videoAssets.map((a) => a.score)),
  };
  const trends = {
    static: computeScoreTrend(staticAssets.map((a) => a.score)),
    video: computeScoreTrend(videoAssets.map((a) => a.score)),
  };

  return (
    <AppMain>
      <PageHeader
        eyebrow="03 / Benchmarks"
        line1="Two formats."
        line2="Never averaged."
        sub="Platform medians and a recent-vs-earlier trend show up once there’s enough history to trust them."
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
        <FormatColumn title="Static · sorted by score" format="static" assets={staticAssets} median={medians.static} platformMedians={platformMediansFor(staticAssets)} trend={trends.static} />
        <FormatColumn title="Video · sorted by score" format="video" assets={videoAssets} median={medians.video} platformMedians={platformMediansFor(videoAssets)} trend={trends.video} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 20px", borderRadius: 18, background: "var(--ws-surface-header)" }}>
        <span className={s.emo} style={{ fontSize: 20 }} aria-hidden="true">
          🧭
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Why these stay separate</span>
          <span style={{ fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.5 }}>
            A video and a static are scored against different criteria sets, so a 70 on each isn’t the same claim. Compare only ever shows the criteria two assets share — it never blends them into one number.
          </span>
        </div>
      </div>

      {(failureThemes.length > 0 || recurringPasses.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
          {failureThemes.length > 0 && (
            <ThemeList title="Recurring failures" description="Checks that failed on more than one asset — exact counts." themes={failureThemes} kind="fail" streaks={failureStreaks} />
          )}
          {recurringPasses.length > 0 && (
            <ThemeList title="What your best work nails" description="Checks that pass on your above-median assets." themes={recurringPasses} kind="pass" />
          )}
        </div>
      )}
    </AppMain>
  );
}
