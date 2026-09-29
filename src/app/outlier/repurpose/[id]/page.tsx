import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepurposeDetail, getCreators, getPostDetail } from "../../live-data";
import { Avatar } from "../../components";
import { CopyScriptButton } from "../copy-script-button";
import { ShareToggle } from "../share-toggle";

export async function generateMetadata(props: PageProps<"/outlier/repurpose/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const detail = await getRepurposeDetail(id);
  return {
    title: detail ? `${detail.title} — Outlier` : "Repurpose — Outlier",
    robots: { index: false, follow: false },
  };
}

export default async function RepurposeDetailPage(props: PageProps<"/outlier/repurpose/[id]">) {
  const { id } = await props.params;
  const [detail, creators] = await Promise.all([getRepurposeDetail(id), getCreators()]);
  if (!detail) notFound();

  const creator = creators.find((c) => c.id === detail.creatorId);
  const handle = creator?.handles[0]?.handle;
  const sourceDetail = await getPostDetail(detail.postId);
  const sourceBeats = sourceDetail?.row.beats ?? [];
  const sourceWordCount =
    sourceDetail?.row.transcript?.reduce((sum, line) => sum + line.text.split(/\s+/).filter(Boolean).length, 0) ?? null;
  const reworkedWordCount = detail.beats.reduce((sum, beat) => sum + beat.script.split(/\s+/).filter(Boolean).length, 0);

  return (
    <div className="ws-page-in px-6 py-[22px]" style={{ maxWidth: 720 }}>
      <Link href="/outlier" className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink-60)" }}>
        ← Home
      </Link>

      <div className="mt-[16px] flex items-start justify-between gap-[16px]">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            {detail.title}
          </h1>
          <div className="mt-[8px] flex flex-wrap items-center gap-[8px]">
            {creator && <Avatar initials={creator.initials} avatarUrl={creator.avatarUrl} size={20} />}
            <p className="text-[12.5px]" style={{ color: "var(--ws-ink-45)" }}>
              Inspired by{" "}
              {handle ? (
                <Link href={`/outlier/video/${detail.postId}`} className="font-medium" style={{ color: "var(--ws-accent-text)" }}>
                  @{handle}
                </Link>
              ) : (
                "a tracked creator"
              )}
              &rsquo;s {detail.sourceScore.toFixed(1)}× post
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-[8px]">
          <ShareToggle repurposeId={detail.id} initialPublic={detail.isPublic} />
          <CopyScriptButton hook={detail.hook} beats={detail.beats} />
        </div>
      </div>

      <div className="ws-card mt-[20px]" style={{ padding: "16px 18px" }}>
        <p className="ws-eyebrow">YOUR CONTENT</p>
        <p className="mt-[6px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-ink)" }}>
          {detail.topic}
        </p>
      </div>

      <div className="mt-[20px]">
        <p className="ws-eyebrow">HOOK</p>
        <div className="ws-card mt-[10px]" style={{ padding: "16px 18px", background: "var(--ws-accent-tint)", borderColor: "var(--ws-accent-tint-border)" }}>
          <p className="text-[14px] font-medium leading-[1.5]" style={{ color: "var(--ws-accent-tint-ink)" }}>
            {detail.hook}
          </p>
        </div>
      </div>

      <div className="mt-[20px] grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <div>
          <p className="ws-eyebrow">ORIGINAL · TECHNIQUE</p>
          <div className="mt-[10px] flex flex-col gap-[10px]">
            {sourceBeats.length > 0 ? (
              sourceBeats.map((beat, i) => (
                <div key={`${beat.name}-${i}`} className="ws-card" style={{ padding: "14px 16px" }}>
                  <div className="flex items-baseline gap-[8px]">
                    <span
                      className="font-semibold uppercase"
                      style={{ fontSize: 9.5, letterSpacing: "0.07em", color: "var(--ws-ink-45)" }}
                    >
                      {beat.name}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                      {beat.timecode}
                    </span>
                  </div>
                  <p className="mt-[6px] text-[12.5px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
                    {beat.analysis}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[12.5px]" style={{ color: "var(--ws-ink-45)" }}>
                Original structure no longer available.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="ws-eyebrow">REWORKED · YOUR TOPIC</p>
          <div className="mt-[10px] flex flex-col gap-[10px]">
            {detail.beats.map((beat, i) => (
              <div
                key={`${beat.name}-${i}`}
                className="ws-card"
                style={{ padding: "14px 16px", background: "var(--ws-accent-tint)", borderColor: "var(--ws-accent-tint-border)" }}
              >
                <span
                  className="font-semibold uppercase"
                  style={{ fontSize: 9.5, letterSpacing: "0.07em", color: "var(--ws-accent-tint-ink)", opacity: 0.75 }}
                >
                  {beat.name}
                </span>
                <p className="mt-[6px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-accent-tint-ink)" }}>
                  {beat.script}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-[18px] flex flex-wrap items-center gap-[18px]"
        style={{ paddingTop: 16, borderTop: "1px solid var(--ws-hairline)" }}
      >
        <span className="text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
          Beats {detail.beats.length} / {sourceBeats.length || detail.beats.length}
        </span>
        {sourceWordCount !== null && (
          <span className="text-[12px]" style={{ color: "var(--ws-ink-45)" }}>
            {reworkedWordCount} words vs {sourceWordCount} original
          </span>
        )}
      </div>
    </div>
  );
}
