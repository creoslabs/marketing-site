import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepurposeDetail, getCreators } from "../../live-data";
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

      <div className="mt-[20px]">
        <p className="ws-eyebrow">SCRIPT</p>
        <div className="mt-[10px] flex flex-col gap-[10px]">
          {detail.beats.map((beat, i) => (
            <div key={`${beat.name}-${i}`} className="ws-card" style={{ padding: "14px 16px" }}>
              <span
                className="font-semibold uppercase"
                style={{ fontSize: 9.5, letterSpacing: "0.07em", color: "var(--ws-accent-text)" }}
              >
                {beat.name}
              </span>
              <p className="mt-[6px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-ink)" }}>
                {beat.script}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
