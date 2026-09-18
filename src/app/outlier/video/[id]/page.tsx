import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostDetail } from "../../live-data";
import { getPlatformLabel } from "../../data";
import { Avatar, PlatformBadge, Thumb } from "../../components";
import { formatCompact } from "../../format";
import { FavouriteButton, OpenOnPlatformButton, RepurposeButton, AnalyzePostButton } from "../video-actions";

export async function generateMetadata(props: PageProps<"/outlier/video/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const detail = await getPostDetail(id);
  return {
    title: detail ? `${detail.post.score.toFixed(1)}× — Outlier` : "Video — Outlier",
    robots: { index: false, follow: false },
  };
}

const STAT_FIELDS = [
  { key: "views", label: "VIEWS", tooltip: "Plays as reported by the API at the last pull." },
  {
    key: "median",
    label: "MEDIAN",
    tooltip: "Derived, not from the API: median views across this creator's pulled posts — the baseline the score divides by.",
  },
  { key: "engagement", label: "ENGAGEMENT", tooltip: "(likes + comments + shares + saves) ÷ views, as returned by the API." },
  { key: "likes", label: "LIKES", tooltip: "Raw like count. Not used in the outlier score." },
  { key: "comments", label: "COMMENTS", tooltip: "Comment count at pull time." },
  { key: "shares", label: "SHARES", tooltip: "Sends to other people. Clearest sign a hook travels beyond the creator's own audience." },
  { key: "saves", label: "SAVES", tooltip: "Bookmark count, when the platform's API exposes it." },
  { key: "followers", label: "FOLLOWERS", tooltip: "Creator-level, not post-level, when the platform's API exposes it." },
] as const;

export default async function VideoDetailPage(props: PageProps<"/outlier/video/[id]">) {
  const { id } = await props.params;
  const detail = await getPostDetail(id);
  if (!detail) notFound();

  const { post, creator, rank, outOf, row } = detail;
  const handle = creator.handles[0].handle;

  const statValues: Record<string, string> = {
    views: formatCompact(post.views),
    median: formatCompact(post.median),
    engagement: `${post.engagement.toFixed(1)}%`,
    likes: formatCompact(post.likes),
    comments: post.comments.toLocaleString(),
    shares: formatCompact(post.shares),
    saves: row.saves != null ? formatCompact(row.saves) : "—",
    followers: row.followers != null ? formatCompact(row.followers) : "—",
  };

  const transcript = row.transcript ?? [];
  const beats = row.beats ?? [];
  const hookTags = row.hook_tags ?? [];
  const wordCount = transcript.reduce((sum, line) => sum + line.text.split(/\s+/).filter(Boolean).length, 0);

  return (
    <div className="ws-page-in">
      <div className="flex items-center gap-[16px] px-6" style={{ height: 56, borderBottom: "1px solid var(--ws-hairline)" }}>
        <Link href="/outlier" className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
          ← Home
        </Link>
        <div className="h-[20px] w-px" style={{ background: "var(--ws-hairline)" }} />
        <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={24} />
        <span className="text-[13px] font-medium" style={{ color: "var(--ws-ink)" }}>
          {handle}
        </span>
        <span className="text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
          {post.postedAt} · {post.duration} · {formatCompact(post.views)} views
        </span>
        <div className="flex-1" />
        <RepurposeButton />
      </div>

      <div className="grid grid-cols-1 gap-[18px] p-6 lg:grid-cols-[306px_1fr_330px]">
        {/* Left rail */}
        <div>
          <Thumb aspectRatio="9/16" radius={12}>
            {row.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element -- an Apify-scraped CDN URL, not a static asset next/image can optimize
              <img
                src={row.thumbnail_url}
                alt={post.caption}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div
              className="absolute left-[10px] top-[10px] max-w-[70%] text-white"
              style={{
                background: "linear-gradient(158deg, var(--ws-accent), #063f8c)",
                borderRadius: 12,
                padding: "9px 12px 11px",
              }}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#fff" }}>
                OUTLIER SCORE
              </p>
              <p className="mt-[2px] leading-none">
                <span className="font-semibold" style={{ fontSize: 40, letterSpacing: "-0.045em" }}>
                  {post.score.toFixed(1)}
                </span>
                <span className="font-medium" style={{ fontSize: 24, color: "rgba(255,255,255,.85)" }}>×</span>
              </p>
              <p className="mt-[3px] text-[11px]" style={{ color: "rgba(255,255,255,.8)" }}>
                rank #{rank} / {outOf}
              </p>
            </div>
            <div className="absolute right-[10px] top-[10px]">
              <PlatformBadge platform={post.platform} />
            </div>
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                height: 60,
                background:
                  "linear-gradient(to top, color-mix(in srgb, var(--ws-ground) 75%, transparent), transparent)",
              }}
            />
            <p className="absolute bottom-[10px] left-[10px] text-[11.5px] font-medium text-white">
              {post.postedAt} · {post.duration}
            </p>
          </Thumb>

          <div className="mt-[10px] flex gap-[8px]">
            <FavouriteButton />
            <OpenOnPlatformButton label={getPlatformLabel(post.platform)} url={row.url} />
          </div>

          <div className="mt-[10px] grid grid-cols-2 gap-[10px]">
            {STAT_FIELDS.map((field, i) => {
              const isLeftColumn = i % 2 === 0;
              return (
                <div
                  key={field.key}
                  className="ws-info-hover ws-card"
                  style={{ padding: "13px 14px 14px" }}
                >
                  <p className="ws-eyebrow" style={{ paddingRight: 18 }}>{field.label}</p>
                  <p
                    className="ws-tabular mt-[6px] font-medium"
                    style={{ fontSize: 20, letterSpacing: "-0.035em", color: "var(--ws-ink)" }}
                  >
                    {statValues[field.key]}
                  </p>
                  <span className="ws-info-dot">ⓘ</span>
                  <div className={`ws-info-tip ${isLeftColumn ? "left" : "right"}`}>{field.tooltip}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle column */}
        <div className="flex flex-col gap-[18px]">
          <div>
            <p className="ws-eyebrow">CAPTION</p>
            <div className="ws-card mt-[10px]" style={{ padding: "14px 16px" }}>
              <p className="text-[13px] leading-[1.6]" style={{ color: "var(--ws-ink)" }}>
                {post.caption.replace(/#\S+/g, "").trim() || "(no caption)"}
              </p>
              <div className="mt-[10px] flex flex-wrap gap-[6px]">
                {(post.caption.match(/#\S+/g) ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[20px] text-[11px] font-medium"
                    style={{ padding: "5px 10px", background: "var(--ws-surface-header)", color: "var(--ws-ink-60)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <p className="ws-eyebrow">STRUCTURE</p>
              <div className="flex-1" />
              {row.analysis_status !== "none" && row.analysis_status !== "done" && (
                <span className="text-[11px]" style={{ color: row.analysis_status === "failed" ? "var(--ws-warn-text)" : "var(--ws-ink-45)" }}>
                  {row.analysis_status === "analyzing" ? "Analyzing…" : row.analysis_error}
                </span>
              )}
            </div>
            {beats.length > 0 ? (
              <div className="mt-[10px] flex flex-col gap-[8px]">
                {beats.map((beat) => (
                  <div key={beat.name + beat.timecode} className="ws-card" style={{ padding: "12px 16px" }}>
                    <div className="flex items-baseline gap-[8px]">
                      <span
                        className="font-semibold uppercase"
                        style={{ fontSize: 9.5, letterSpacing: "0.07em", color: "var(--ws-accent-text)" }}
                      >
                        {beat.name}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                        {beat.timecode}
                      </span>
                    </div>
                    <p className="mt-[6px] text-[12px] leading-[1.45]" style={{ color: "var(--ws-ink-60)" }}>
                      {beat.analysis}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ws-card mt-[10px]" style={{ padding: "14px 16px" }}>
                <p className="text-[12.5px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
                  {row.video_url || row.platform === "TT"
                    ? "Not analyzed yet — transcribe the audio and identify the hook, structure, and beats."
                    : "No downloadable video for this post, so structure can't be analyzed."}
                </p>
                {(row.video_url || row.platform === "TT") && (
                  <div className="mt-[12px]">
                    <AnalyzePostButton postId={post.id} status={row.analysis_status} />
                  </div>
                )}
              </div>
            )}
          </div>

          {hookTags.length > 0 && (
            <div>
              <p className="ws-eyebrow">HOOK STYLE</p>
              <div className="mt-[10px] flex flex-wrap gap-[6px]">
                {hookTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[20px] text-[11px] font-medium"
                    style={{ padding: "5px 10px", background: "var(--ws-accent-tint)", color: "var(--ws-accent-tint-ink)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — transcript */}
        <div>
          <div className="flex items-center">
            <h2 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Transcript
            </h2>
            <div className="flex-1" />
            {transcript.length > 0 && (
              <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                auto · {wordCount} words
              </span>
            )}
          </div>
          {transcript.length === 0 ? (
            <p className="mt-[12px] text-[12px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
              {row.analysis_status === "analyzing" ? "Transcribing…" : "No transcript yet."}
            </p>
          ) : (
            <div className="mt-[12px] flex flex-col gap-[2px]">
              {transcript.map((line, i) => (
                <div
                  key={`${line.t}-${i}`}
                  className={line.isHook ? "" : "ws-row-hover"}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "34px 1fr",
                    gap: 9,
                    borderRadius: 6,
                    padding: "7px 8px",
                    background: line.isHook ? "var(--ws-accent-tint)" : "transparent",
                  }}
                >
                  <span
                    className="ws-tabular text-[11px]"
                    style={{ color: line.isHook ? "var(--ws-accent-tint-ink)" : "var(--ws-ink-45)" }}
                  >
                    {line.t}
                  </span>
                  <span
                    className="text-[12.5px] leading-[1.4]"
                    style={{ color: line.isHook ? "var(--ws-accent-tint-ink)" : "var(--ws-ink-60)" }}
                  >
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
