import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPost,
  getCreator,
  getRankInfo,
  getPlatformLabel,
  TRANSCRIPT,
  BEATS,
  HOOK_TAGS,
} from "../../data";
import { Avatar, PlatformBadge, Thumb } from "../../components";
import { formatCompact } from "../../format";
import { FavouriteButton, OpenOnPlatformButton, RepurposeButton } from "../video-actions";

export async function generateMetadata(props: PageProps<"/outlier/video/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const post = getPost(id);
  return {
    title: post ? `${post.score.toFixed(1)}× — Outlier` : "Video — Outlier",
    robots: { index: false, follow: false },
  };
}

const STAT_FIELDS = [
  { key: "views", label: "VIEWS", tooltip: "Plays as reported by the API at the last pull, 12 minutes ago." },
  {
    key: "median",
    label: "MEDIAN",
    tooltip:
      "Derived, not from the API: median views across this creator's trailing 20 posts — the baseline the score divides by.",
  },
  { key: "engagement", label: "ENGAGEMENT", tooltip: "(likes + comments + shares + saves) ÷ views, as returned by the API." },
  { key: "likes", label: "LIKES", tooltip: "Raw like count. Not used in the outlier score." },
  { key: "comments", label: "COMMENTS", tooltip: "Comment count at pull time." },
  {
    key: "shares",
    label: "SHARES",
    tooltip: "Sends to other people. Clearest sign a hook travels beyond the creator's own audience.",
  },
  {
    key: "saves",
    label: "SAVES",
    tooltip: "Strongest repurpose signal — 1.6% of views, unusually high for this niche.",
  },
  {
    key: "followers",
    label: "FOLLOWERS",
    tooltip: "Creator-level, not post-level. Views above follower count mean the post left the existing audience.",
  },
] as const;

export default async function VideoDetailPage(props: PageProps<"/outlier/video/[id]">) {
  const { id } = await props.params;
  const post = getPost(id);
  if (!post) notFound();

  const creator = getCreator(post.creatorId);
  const { rank, outOf } = getRankInfo(post);
  const wordCount = TRANSCRIPT.reduce((sum, line) => sum + line.text.split(/\s+/).length, 0);

  const statValues: Record<string, string> = {
    views: formatCompact(post.views),
    median: formatCompact(post.median),
    engagement: `${post.engagement.toFixed(1)}%`,
    likes: formatCompact(post.likes),
    comments: post.comments.toLocaleString(),
    shares: formatCompact(post.shares),
    saves: formatCompact(post.saves),
    followers: formatCompact(post.followers),
  };

  return (
    <div className="ws-page-in">
      <div className="flex items-center gap-[16px] px-6" style={{ height: 56, borderBottom: "1px solid var(--ws-hairline)" }}>
        <Link href="/outlier" className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
          ← Home
        </Link>
        <div className="h-[20px] w-px" style={{ background: "var(--ws-hairline)" }} />
        <Avatar initials={creator.initials} size={24} />
        <span className="text-[13px] font-medium" style={{ color: "var(--ws-ink)" }}>
          {creator.handles[0].handle}
        </span>
        <span className="text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
          {post.postedAt} · {post.duration} · {formatCompact(post.views)} views
        </span>
        <div className="flex-1" />
        <RepurposeButton />
      </div>

      <div
        className="grid grid-cols-1 gap-[18px] p-6 lg:grid-cols-[306px_1fr_330px]"
      >
        {/* Left rail */}
        <div>
          <Thumb aspectRatio="9/16" radius={12}>
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
            <OpenOnPlatformButton label={getPlatformLabel(post.platform)} />
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
                {post.caption.replace(/#\S+/g, "").trim()}
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
            <p className="ws-eyebrow">DESCRIPTION</p>
            <div className="ws-card mt-[10px]" style={{ padding: "14px 16px" }}>
              <p className="text-[12.5px] leading-[1.6]" style={{ color: "var(--ws-ink-60)" }}>
                {post.description}
              </p>
            </div>
          </div>

          <div>
            <p className="ws-eyebrow">STRUCTURE</p>
            <div className="mt-[10px] flex flex-col gap-[8px]">
              {BEATS.map((beat) => (
                <div key={beat.name} className="ws-card" style={{ padding: "12px 16px" }}>
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
          </div>

          <div>
            <p className="ws-eyebrow">HOOK STYLE</p>
            <div className="mt-[10px] flex flex-wrap gap-[6px]">
              {HOOK_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[20px] text-[11px] font-medium"
                  style={{ padding: "5px 10px", background: "var(--ws-accent-tint)", color: "var(--ws-accent-tint-ink)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-[10px] text-[12px] leading-[1.5]" style={{ color: "var(--ws-ink-45)" }}>
              Same negative-command opener appears in 7 above-median posts across 4 tracked creators this
              month.
            </p>
          </div>
        </div>

        {/* Right column — transcript */}
        <div>
          <div className="flex items-center">
            <h2 className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              Transcript
            </h2>
            <div className="flex-1" />
            <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
              auto · {wordCount} words
            </span>
          </div>
          <div className="mt-[12px] flex flex-col gap-[2px]">
            {TRANSCRIPT.map((line) => (
              <div
                key={line.t}
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
        </div>
      </div>
    </div>
  );
}
