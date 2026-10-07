import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepurposeDetail, getCreators, getPostDetail } from "../../live-data";
import { CopyScriptButton } from "../copy-script-button";
import { ShareToggle } from "../share-toggle";
import { AppMain, Avatar, Card, CardHead, Mono, PageHeader, appStyles as s } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";

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
  const sourceWordCount = sourceDetail?.row.transcript?.reduce((sum, line) => sum + line.text.split(/\s+/).filter(Boolean).length, 0) ?? null;
  const reworkedWordCount = detail.beats.reduce((sum, beat) => sum + beat.script.split(/\s+/).filter(Boolean).length, 0);

  return (
    <AppMain>
      <Link href="/outlier" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ws-ink-45)", alignSelf: "flex-start" }}>
        <Icon name="chevronLeft" size={14} />
        Home
      </Link>

      <PageHeader
        eyebrow={`Repurposed${handle ? ` · from @${handle}` : ""} · ${detail.sourceScore.toFixed(1)}×`}
        line1={detail.title}
        sub={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {creator && <Avatar initials={creator.initials} src={creator.avatarUrl} size={20} />}
            Inspired by{" "}
            {handle ? (
              <Link href={`/outlier/video/${detail.postId}`} style={{ fontWeight: 600, color: "var(--ws-ink)" }}>
                @{handle}
              </Link>
            ) : (
              "a tracked creator"
            )}
            ’s {detail.sourceScore.toFixed(1)}× post
          </span>
        }
        actions={
          <>
            <ShareToggle repurposeId={detail.id} initialPublic={detail.isPublic} />
            <CopyScriptButton hook={detail.hook} beats={detail.beats} />
          </>
        }
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
        <Card style={{ flex: "1 1 360px" }}>
          <CardHead label="Your content" />
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{detail.topic}</p>
        </Card>
        <Card paper ring style={{ flex: "2 1 520px" }}>
          <CardHead label="Hook" paper />
          <p style={{ margin: 0, fontSize: 19, fontWeight: 700, lineHeight: 1.35 }}>{detail.hook}</p>
        </Card>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <Mono className={s.cardLabel} style={{ fontSize: 11 }}>
            Original · technique
          </Mono>
          {sourceBeats.length > 0 ? (
            sourceBeats.map((beat, i) => (
              <Card key={`${beat.name}-${i}`} style={{ padding: 18, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{beat.name}</span>
                  <Mono className={s.cardLabel} style={{ fontSize: 10 }}>
                    {beat.timecode}
                  </Mono>
                </div>
                <span style={{ fontSize: 14, color: "var(--ws-ink-60)", lineHeight: 1.5 }}>{beat.analysis}</span>
              </Card>
            ))
          ) : (
            <span style={{ fontSize: 14, color: "var(--ws-ink-45)" }}>Original structure no longer available.</span>
          )}
        </div>

        <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <Mono className={s.cardLabel} style={{ fontSize: 11, color: "var(--ws-accent)" }}>
            Reworked · your topic
          </Mono>
          {detail.beats.map((beat, i) => (
            <Card key={`${beat.name}-${i}`} style={{ padding: 18, gap: 8, borderColor: "var(--ws-accent-tint-border)" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{beat.name}</span>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{beat.script}</span>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, paddingTop: 16, borderTop: "1px solid var(--ws-hairline)", fontSize: 13, color: "var(--ws-ink-45)" }}>
        <span>
          Beats {detail.beats.length} / {sourceBeats.length || detail.beats.length}
        </span>
        {sourceWordCount !== null && (
          <span>
            {reworkedWordCount} words vs {sourceWordCount} original
          </span>
        )}
      </div>
    </AppMain>
  );
}
