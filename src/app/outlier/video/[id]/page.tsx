import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostDetail, getCollections } from "../../live-data";
import { getPlatformLabel } from "../../data";
import { formatCompact } from "../../format";
import { SendToMenu } from "@/components/integrations/send-to-menu";
import { FavouriteButton, OpenOnPlatformButton, RepurposeButton, AnalyzePostButton } from "../video-actions";
import { CollectionMenu } from "../../collection-menu";
import { AppMain, Avatar, Card, CardHead, Chip, Mono, appStyles as s, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";
import { MediaTile } from "@/components/app/media";

export async function generateMetadata(props: PageProps<"/outlier/video/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const detail = await getPostDetail(id);
  return {
    title: detail ? `${detail.post.score.toFixed(1)}× — Outlier` : "Video — Outlier",
    robots: { index: false, follow: false },
  };
}

// Beat colours cycle through the neutral ramp; the hook is always accent.
const BEAT_COLORS = ["var(--ws-accent)", "#8c8a84", "#5e5c56", "#8c8a84", "#b9b6ae", "#5e5c56"];

function parseSeconds(tc: string): number | null {
  const m = tc.match(/(\d+):(\d{2})\s*[–-]\s*(\d+):(\d{2})/);
  if (!m) return null;
  return Number(m[3]) * 60 + Number(m[4]) - (Number(m[1]) * 60 + Number(m[2]));
}

const HEADLINE_STATS = [
  { key: "views", label: "Views", tip: "Plays as reported by the API at the last pull." },
  { key: "median", label: "Median", tip: "Derived, not from the API: median views across this creator's pulled posts — the baseline the score divides by." },
  { key: "likes", label: "Likes", tip: "Raw like count. Not used in the outlier score." },
  { key: "comments", label: "Comments", tip: "Comment count at pull time." },
  { key: "shares", label: "Shares", tip: "Sends to other people. Clearest sign a hook travels beyond the creator's own audience." },
  { key: "engagement", label: "Engagement", tip: "(likes + comments + shares + saves) ÷ views, as returned by the API." },
] as const;

export default async function VideoDetailPage(props: PageProps<"/outlier/video/[id]">) {
  const { id } = await props.params;
  const [detail, collections] = await Promise.all([getPostDetail(id), getCollections()]);
  if (!detail) notFound();

  const { post, creator, rank, outOf, row } = detail;
  const handle = creator.handles.find((h) => h.platform === post.platform)?.handle ?? creator.handles[0].handle;
  const platform = getPlatformLabel(post.platform);

  const statValues: Record<string, string> = {
    views: formatCompact(post.views),
    median: formatCompact(post.median),
    engagement: `${post.engagement.toFixed(1)}%`,
    likes: formatCompact(post.likes),
    comments: post.comments.toLocaleString(),
    shares: formatCompact(post.shares),
  };
  const extraStats = [
    ...(row.saves != null ? [{ key: "saves", label: "Saves", value: formatCompact(row.saves), tip: "Bookmark count, when the platform's API exposes it." }] : []),
    ...(row.followers != null ? [{ key: "followers", label: "Followers", value: formatCompact(row.followers), tip: "Creator-level, not post-level." }] : []),
  ];

  const transcript = row.transcript ?? [];
  const beats = row.beats ?? [];
  const hookTags = row.hook_tags ?? [];
  const wordCount = transcript.reduce((sum, line) => sum + line.text.split(/\s+/).filter(Boolean).length, 0);
  const beatWeights = beats.map((b) => Math.max(1, parseSeconds(b.timecode) ?? 1));
  const hashtags = post.caption.match(/#\S+/g) ?? [];

  return (
    <AppMain>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <Link href="/outlier/feed" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ws-ink-45)" }}>
          <Icon name="chevronLeft" size={14} />
          Feed
        </Link>
        <Avatar initials={creator.initials} src={creator.avatarUrl} size={32} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>@{handle}</span>
          <span style={{ fontSize: 12, color: "var(--ws-ink-45)" }}>
            {platform} · {post.postedAt} · {post.duration}
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SendToMenu kind="outlier" id={post.id} product="outlier" />
          <CollectionMenu postId={post.id} collections={collections} />
          <RepurposeButton postId={post.id} ready={row.analysis_status === "done"} />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 300px", minWidth: 0, width: 300, display: "flex", flexDirection: "column", gap: 20 }}>
          <MediaTile src={row.thumbnail_url} platform={platform} label={post.duration} height={520} emoji="🎬" />
          <div style={{ display: "flex", gap: 8 }}>
            <FavouriteButton postId={post.id} initialFavourited={post.favourite} />
            <OpenOnPlatformButton label={platform} url={row.url} />
          </div>
        </div>

        <div style={{ flex: "2 1 460px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <Card paper ring style={{ padding: 22 }}>
            <Mono className={s.cardLabel} style={{ fontSize: 10, color: "#55534d" }}>
              Outlier score
            </Mono>
            <span className={s.disp} style={{ fontSize: 72, letterSpacing: "-0.05em", lineHeight: 0.85 }}>
              {post.score.toFixed(1)}×
            </span>
            <span style={{ fontSize: 14, color: "#46443f" }}>
              {formatCompact(post.views)} views ÷ {formatCompact(post.median)} running median · <b style={{ color: "#0b0b0a" }}>#{rank} of {outOf}</b> from @{handle}
            </span>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {[...HEADLINE_STATS.map((f) => ({ key: f.key, label: f.label, value: statValues[f.key], tip: f.tip })), ...extraStats].map((f) => (
              <div key={f.key} title={f.tip} style={{ background: "var(--ws-surface-header)", borderRadius: 14, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                <Mono className={s.cardLabel} style={{ fontSize: 9 }}>
                  {f.label}
                </Mono>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{f.value}</span>
              </div>
            ))}
          </div>

          <Card>
            <CardHead
              label={`Structure${beats.length > 0 ? ` · ${beats.length} beats` : ""}`}
              right={
                row.analysis_status !== "none" && row.analysis_status !== "done" ? (
                  <Mono className={s.cardLabel} style={{ fontSize: 10, color: row.analysis_status === "failed" ? "var(--ws-warn)" : undefined }}>
                    {row.analysis_status === "analyzing" ? "Analyzing…" : row.analysis_error}
                  </Mono>
                ) : (
                  <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                    {post.duration}
                  </Mono>
                )
              }
            />
            {beats.length > 0 ? (
              <>
                <div style={{ display: "flex", gap: 3 }} aria-hidden="true">
                  {beats.map((beat, i) => (
                    <div key={beat.name + beat.timecode} style={{ flex: `${beatWeights[i]} 1 0`, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ height: 10, borderRadius: 5, background: BEAT_COLORS[i % BEAT_COLORS.length] }} />
                      <Mono style={{ fontSize: 9, color: i === 0 ? "var(--ws-ink)" : "var(--ws-ink-45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{beat.name}</Mono>
                    </div>
                  ))}
                </div>
                <div>
                  {beats.map((beat, i) => (
                    <div key={beat.name + beat.timecode} style={{ display: "flex", gap: 14, padding: "14px 0", borderTop: "1px solid var(--ws-hairline)" }}>
                      <span style={{ width: 10, height: 10, flex: "none", marginTop: 4, borderRadius: "50%", background: BEAT_COLORS[i % BEAT_COLORS.length] }} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{beat.name}</span>
                          <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                            {beat.timecode}
                          </Mono>
                        </div>
                        <span style={{ fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.45 }}>{beat.analysis}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span style={{ fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.5 }}>
                  {row.video_url || row.platform === "TT"
                    ? "Not analyzed yet — transcribe the audio and identify the hook, structure, and beats."
                    : "No downloadable video for this post, so structure can't be analyzed."}
                </span>
                {(row.video_url || row.platform === "TT") && (
                  <div>
                    <AnalyzePostButton postId={post.id} status={row.analysis_status} />
                  </div>
                )}
              </div>
            )}
            {hookTags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", paddingTop: 8 }}>
                <Mono className={s.cardLabel} style={{ fontSize: 10, marginRight: 4 }}>
                  Hook style
                </Mono>
                {hookTags.map((tag, i) => (
                  <Link key={tag} href={`/outlier/tags/${encodeURIComponent(tag)}`} className={cx(s.mono, s.chip, i === 0 ? s.chipPaper : s.chipOutline)}>
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card style={{ padding: 20 }}>
            <CardHead label="Caption" />
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ws-ink-60)" }}>{post.caption.replace(/#\S+/g, "").trim() || "(no caption)"}</p>
            {hashtags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {hashtags.map((tag) => (
                  <Chip key={tag} variant="soft">
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <Card style={{ padding: 18 }}>
            <CardHead
              label="Transcript"
              right={
                transcript.length > 0 && (
                  <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                    Auto · {wordCount} words
                  </Mono>
                )
              }
            />
            {transcript.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: "var(--ws-ink-45)", lineHeight: 1.5 }}>{row.analysis_status === "analyzing" ? "Transcribing…" : "No transcript yet."}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {transcript.map((line, i) => (
                  <div
                    key={`${line.t}-${i}`}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 12,
                      ...(line.isHook ? { background: "var(--ws-surface-header)", boxShadow: "inset 2px 0 0 var(--ws-accent)" } : null),
                    }}
                  >
                    <Mono style={{ width: 34, flex: "none", fontSize: 10, color: line.isHook ? "var(--ws-accent)" : "var(--ws-ink-45)", paddingTop: 2 }}>{line.t}</Mono>
                    <span style={{ fontSize: 14, lineHeight: 1.45, color: line.isHook ? "var(--ws-ink)" : "var(--ws-ink-60)" }}>{line.text}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppMain>
  );
}
