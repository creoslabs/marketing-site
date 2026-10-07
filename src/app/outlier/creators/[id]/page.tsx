import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorDetail } from "../../live-data";
import { getPlatformLabel } from "../../data";
import { AddPlatformButton, BatchRepurposeButton, PullWithLimit, RemoveHandleButton } from "../../creator-actions";
import { formatCompact } from "../../format";
import { NotesField } from "./notes-field";
import { CreatorMoreMenu } from "./creator-menu";
import { CreatorPosts } from "./posts-grid";
import { AppMain, Avatar, Card, CardHead, Chip, Mono, StatsRow, appStyles as s, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";
import { EmptyState } from "@/components/ws-empty-state";

export async function generateMetadata(props: PageProps<"/outlier/creators/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const detail = await getCreatorDetail(id);
  return {
    title: detail ? `${detail.creator.displayName} — Outlier` : "Creator — Outlier",
    robots: { index: false, follow: false },
  };
}

export default async function CreatorDetailPage(props: PageProps<"/outlier/creators/[id]">) {
  const { id } = await props.params;
  const { platform: platformParam } = await props.searchParams;
  const platformParamValue = Array.isArray(platformParam) ? platformParam[0] : platformParam;
  const detail = await getCreatorDetail(id);
  if (!detail) notFound();

  const { creator, posts, patterns } = detail;
  const isThin = creator.handles.some((h) => h.thin);

  // Each platform is scored against its own median, so the chart and post
  // list below only ever show one platform at a time — blending TikTok and
  // Instagram posts into one bar chart would compare two different
  // baselines as if they were the same scale.
  const activePlatform =
    creator.platformStats.find((st) => st.platform === platformParamValue)?.platform ?? creator.platformStats[0]?.platform ?? null;
  const platformPosts = activePlatform ? posts.filter((p) => p.platform === activePlatform) : posts;
  const activeMedian = creator.platformStats.find((st) => st.platform === activePlatform)?.median ?? creator.median;

  // Latest 30 posts, oldest → newest, scaled so the median and the 2× line
  // both sit inside the chart.
  const history = [...platformPosts].sort((a, b) => new Date(a.postedAtIso).getTime() - new Date(b.postedAtIso).getTime()).slice(-30);
  const maxViews = Math.max(...history.map((h) => h.views), activeMedian * 2.2, 1);
  const medianPct = (activeMedian / maxViews) * 100;
  const twoXPct = (activeMedian * 2 * 100) / maxViews;

  const bestPost = platformPosts.length > 0 ? platformPosts.reduce((b, p) => (p.score > b.score ? p : b), platformPosts[0]) : null;
  const above2x = platformPosts.filter((p) => p.score >= 2).length;
  const trend = creator.medianTrend;
  const maxHookCount = Math.max(...patterns.hookTags.map((t) => t.count), 1);
  const handleFor = Object.fromEntries(creator.handles.map((h) => [h.platform, h.handle]));
  const filename = `${creator.displayName.replace(/\s+/g, "-").toLowerCase()}-posts.csv`;

  return (
    <AppMain>
      <Link href="/outlier/creators" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ws-ink-45)", alignSelf: "flex-start" }}>
        <Icon name="chevronLeft" size={14} />
        Creators
      </Link>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
        <Avatar initials={creator.initials} src={creator.avatarUrl} size={72} />
        <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 className={s.disp} style={{ margin: 0, fontSize: 52, lineHeight: 0.9 }}>
            {creator.displayName}
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {isThin && <Chip variant="fail">Thin history</Chip>}
            {creator.handles.map((h) => (
              <Chip key={h.id} variant="outline" style={{ paddingRight: 4 }}>
                {h.platform} @{h.handle}
                <RemoveHandleButton handleId={h.id} handle={h.handle} />
              </Chip>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <PullWithLimit handles={creator.handles} />
          <AddPlatformButton creatorId={creator.id} />
          <CreatorMoreMenu creatorId={creator.id} handle={creator.handles[0]?.handle ?? creator.displayName} posts={posts} filename={filename} />
        </div>
      </div>

      <StatsRow
        stats={[
          { label: "Median views", value: formatCompact(activeMedian), note: "running median" },
          { label: "Best 30D", value: `${creator.bestScore.toFixed(1)}×`, note: bestPost ? bestPost.caption.split("\n")[0].slice(0, 28) : "—", accent: true },
          { label: "Above 2×", value: above2x, note: above2x === 1 ? "post" : "posts" },
          { label: "Cadence", value: creator.cadence, note: trend === null ? "not enough history for a trend" : `${trend >= 0 ? "+" : "−"}${Math.abs(trend)}% median vs earlier` },
        ]}
      />

      <NotesField creatorId={creator.id} initialNotes={creator.notes} />

      {creator.platformStats.length > 1 && (
        <div className={s.toolbar} style={{ borderRadius: 22 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label="Platform">
            {creator.platformStats.map((stat) => (
              <Link
                key={stat.platform}
                href={`/outlier/creators/${creator.id}?platform=${stat.platform}`}
                aria-current={stat.platform === activePlatform ? "page" : undefined}
                className={cx(s.mono, s.chip, stat.platform === activePlatform ? s.chipPaper : s.chipOutline)}
              >
                {getPlatformLabel(stat.platform)} · {stat.postCount} posts
              </Link>
            ))}
          </div>
          <span className={s.toolbarNote}>Each platform is scored against its own median — scores stay comparable across them.</span>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
        <div style={{ flex: "2 1 700px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ flex: 1 }}>
            <CardHead
              label={`Every post vs their median${activePlatform && creator.platformStats.length > 1 ? ` · ${getPlatformLabel(activePlatform)}` : ""}`}
              right={
                <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                  Last {history.length} posts
                </Mono>
              }
            />
            {history.length === 0 ? (
              <EmptyState title="No posts pulled yet" description="Views-per-post needs at least a few pulled posts before a median means anything." />
            ) : (
              <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 4, height: 160 }} role="img" aria-label={`Views for the last ${history.length} posts against a running median of ${formatCompact(activeMedian)}`}>
                {history.map((post) => (
                  <div
                    key={post.id}
                    title={`${post.postedAt} · ${formatCompact(post.views)} views · ${post.score.toFixed(1)}×`}
                    style={{ flex: 1, height: `${Math.max(4, (post.views / maxViews) * 100)}%`, borderRadius: "3px 3px 0 0", background: post.score >= 2 ? "var(--ws-accent)" : "var(--ws-hairline-strong)" }}
                  />
                ))}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: `${medianPct}%`, borderTop: "1px dashed var(--ws-ink-45)" }} />
                <span className={s.mono} style={{ position: "absolute", right: 0, bottom: `calc(${medianPct}% + 6px)`, fontSize: 9, color: "var(--ws-ink-45)" }}>
                  Median {formatCompact(activeMedian)}
                </span>
                {twoXPct <= 100 && (
                  <>
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: `${twoXPct}%`, borderTop: "1px dashed var(--ws-accent)" }} />
                    <span className={s.mono} style={{ position: "absolute", right: 0, bottom: `calc(${twoXPct}% + 6px)`, fontSize: 9, color: "var(--ws-accent)" }}>
                      2× line
                    </span>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>

        <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ flex: 1 }}>
            <CardHead label="Hook styles" right={patterns.analyzedCount > 0 ? <Mono className={s.cardLabel} style={{ fontSize: 10 }}>From {patterns.analyzedCount} analyzed</Mono> : undefined} />
            {patterns.analyzedCount === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: "var(--ws-ink-45)", lineHeight: 1.5 }}>
                No analyzed posts yet — transcribe &amp; analyze one of this creator’s posts to see which hooks and beats work for them.
              </p>
            ) : (
              <>
                {patterns.hookTags.map((tag, i) => (
                  <div key={tag.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Link href={`/outlier/tags/${encodeURIComponent(tag.label)}`} style={{ width: 150, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tag.label}
                    </Link>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--ws-surface-header)" }}>
                      <div style={{ width: `${(tag.count / maxHookCount) * 100}%`, height: 8, borderRadius: 4, background: i === 0 ? "var(--ws-accent)" : "var(--ws-grey)" }} />
                    </div>
                    <span style={{ width: 60, textAlign: "right", fontSize: 13, color: "var(--ws-ink-60)" }}>
                      {tag.count} post{tag.count === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
                {patterns.beatNames.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 8 }}>
                    <Mono className={s.cardLabel} style={{ fontSize: 10, marginRight: 4 }}>
                      Common beats
                    </Mono>
                    {patterns.beatNames.map((beat) => (
                      <Chip key={beat.label} variant="soft">
                        {beat.label} · {beat.count}/{patterns.analyzedCount}
                      </Chip>
                    ))}
                  </div>
                )}
                <div>
                  <BatchRepurposeButton posts={posts} />
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <CreatorPosts posts={platformPosts} creator={{ initials: creator.initials, avatarUrl: creator.avatarUrl, handleFor }} />
    </AppMain>
  );
}
