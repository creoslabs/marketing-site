import type { Metadata } from "next";
import { getJobs, getCreators } from "../live-data";
import { groupPullFailures, pullsPaused } from "./../pull-errors";
import { PullHandlesButton } from "../creator-actions";
import { DismissableGroup, DismissButton } from "./dismissable";
import { AppMain, Avatar, Button, Card, CardHead, Chip, PageHeader, appStyles as s } from "@/components/app/ui";
import { EmptyState } from "@/components/ws-empty-state";

export const metadata: Metadata = {
  title: "Progress — Outlier",
  robots: { index: false, follow: false },
};

// Module-level so render stays pure (the lint rule flags Date.now() inside a component).
const nowMs = () => Date.now();

const STAGES = ["Pull metadata", "Download", "Transcribe", "Score", "Trend match"];

export default async function ProgressPage() {
  const [{ jobs, finished }, creators] = await Promise.all([getJobs(), getCreators()]);
  const creatorById = new Map(creators.map((c) => [c.id, c]));

  const running = jobs.filter((job) => job.state === "running");
  const queued = jobs.filter((job) => job.state === "queued");
  const failed = jobs.filter((job) => job.state === "failed");
  const groups = groupPullFailures(jobs);
  const paused = pullsPaused(jobs, finished[0]?.finishedAtIso ?? null);
  const allHandles = creators.flatMap((c) => c.handles);
  const dayAgo = nowMs() - 24 * 60 * 60 * 1000;
  const finishedToday = finished.filter((f) => new Date(f.finishedAtIso).getTime() > dayAgo);

  if (jobs.length === 0 && finished.length === 0) {
    return (
      <AppMain>
        <PageHeader eyebrow="05 / Progress" line1="Nothing to show yet." />
        <EmptyState size="large" emoji="⏳" title="Nothing to show yet" description="Once you pull a creator's posts, pulls and analysis jobs will show up here." />
      </AppMain>
    );
  }

  return (
    <AppMain>
      <PageHeader
        eyebrow="05 / Progress"
        line1={paused ? "Pulls paused." : `${running.length} running.`}
        line2={`${running.length} running · ${queued.length} queued · ${failed.length} failed`}
        actions={<PullHandlesButton handles={allHandles} variant="ghost" icon="refresh" />}
      />

      <Card style={{ padding: 20 }}>
        <CardHead label="Pipeline" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {STAGES.map((stage, i) => (
            <span key={stage} style={{ display: "contents" }}>
              <Chip variant={paused && i === 0 ? "fail" : "soft"}>{paused && i === 0 ? `✕ ${stage}` : stage}</Chip>
              {i < STAGES.length - 1 && <span style={{ color: "var(--ws-hairline-strong)" }}>→</span>}
            </span>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "2 1 700px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {groups.map((group) => {
            const signature = `${group.key}:${group.jobs.length}`;
            const perCreator = new Map<string, { handle: string; count: number }>();
            for (const job of group.jobs) {
              const key = job.creatorId || job.handle;
              const entry = perCreator.get(key) ?? { handle: job.handle, count: 0 };
              entry.count += 1;
              perCreator.set(key, entry);
            }
            const isLimit = group.kind === "limit";
            const isToken = group.kind === "token";
            const retryHandles = group.jobs.filter((j) => j.handleId).map((j) => ({ id: j.handleId, handle: j.handle }));
            const uniqueRetry = [...new Map(retryHandles.map((h) => [h.id, h])).values()];
            return (
              <DismissableGroup key={group.key} signature={signature}>
                <div style={{ background: "var(--ws-warn-tint)", border: "1px solid var(--ws-warn-tint-border)", borderRadius: 22, padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }}>
                    <span className={s.emo} style={{ fontSize: 26 }} aria-hidden="true">
                      ⚠️
                    </span>
                    <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 6 }}>
                      <span className={s.mono} style={{ fontSize: 10, color: "var(--ws-warn)" }}>
                        {group.jobs.length} failed pull{group.jobs.length === 1 ? "" : "s"}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 700 }}>{isLimit ? "Apify’s monthly usage limit was reached." : group.title}</span>
                      <span style={{ fontSize: 15, color: "var(--ws-ink-60)", lineHeight: 1.5 }}>
                        {isLimit
                          ? "Every pull since then has failed at the first step. Your existing posts and scores are safe. Pulls will work again when the limit resets, or straight away with a new token."
                          : isToken
                            ? "Apify rejected the token used for these pulls. Your existing posts and scores are safe. Update the token and retry."
                            : "These pulls failed with the same error. Your existing posts and scores are safe."}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {(isLimit || isToken) && (
                      <Button variant="paper" href="/workspace/account">
                        Update Apify token
                      </Button>
                    )}
                    <PullHandlesButton handles={uniqueRetry} variant="ghost" icon="refresh">
                      {`Retry all ${group.jobs.length}`}
                    </PullHandlesButton>
                    <DismissButton signature={signature} />
                  </div>
                  <div>
                    {[...perCreator.entries()].map(([key, entry]) => {
                      const creator = creatorById.get(key);
                      return (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--ws-warn-tint-border)" }}>
                          <Avatar initials={creator?.initials ?? entry.handle.slice(0, 2).toUpperCase()} src={creator?.avatarUrl} size={30} />
                          <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>@{entry.handle}</span>
                          <span style={{ fontSize: 13, color: "var(--ws-ink-60)" }}>
                            {entry.count} failed pull{entry.count === 1 ? "" : "s"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <details style={{ borderTop: "1px solid var(--ws-warn-tint-border)", paddingTop: 14 }}>
                    <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--ws-ink-45)" }}>Show raw error</summary>
                    <pre style={{ margin: "12px 0 0", padding: 14, background: "var(--ws-ground)", borderRadius: 12, fontSize: 12, color: "var(--ws-ink-60)", whiteSpace: "pre-wrap", overflowX: "auto" }}>{group.raw}</pre>
                  </details>
                </div>
              </DismissableGroup>
            );
          })}

          {groups.length === 0 && running.length === 0 && queued.length === 0 && (
            <Card>
              <CardHead label="Status" />
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--ws-surface-header)", borderRadius: 14, padding: 16 }}>
                <span className={s.emo} style={{ fontSize: 18 }} aria-hidden="true">
                  ✅
                </span>
                <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>No failed pulls. Everything that ran finished.</span>
              </div>
            </Card>
          )}

          {queued.length > 0 && (
            <Card>
              <CardHead label="Queue" />
              {queued.map((job, i) => {
                const creator = creatorById.get(job.creatorId);
                return (
                  <div key={job.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid var(--ws-hairline)" }}>
                    <span className={s.tabular} style={{ width: 18, fontSize: 12, fontWeight: 700, color: "var(--ws-ink-45)" }}>
                      {i + 1}
                    </span>
                    <Avatar initials={creator?.initials ?? "?"} src={creator?.avatarUrl} size={26} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>@{job.handle}</span>
                    <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>{job.scope}</span>
                    <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--ws-ink-45)" }}>{job.waitReason || "queued"}</span>
                  </div>
                );
              })}
            </Card>
          )}
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ padding: 22 }}>
            <CardHead label="Running" />
            {running.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--ws-surface-header)", borderRadius: 14, padding: 16 }}>
                <span className={s.emo} style={{ fontSize: 18 }} aria-hidden="true">
                  {paused ? "⏸️" : "💤"}
                </span>
                <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>{paused ? "Nothing running while pulls are paused." : "Nothing running right now."}</span>
              </div>
            ) : (
              running.map((job) => {
                const creator = creatorById.get(job.creatorId);
                return (
                  <div key={job.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={creator?.initials ?? "?"} src={creator?.avatarUrl} size={26} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>@{job.handle}</span>
                      <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>{job.scope}</span>
                    </div>
                    <div className="ws-progress-indeterminate" style={{ height: 4, borderRadius: 2, background: "var(--ws-hairline)" }} />
                    <span style={{ fontSize: 13, color: "var(--ws-ink-45)" }}>{job.stage}</span>
                  </div>
                );
              })
            )}
          </Card>

          <Card style={{ padding: 22 }}>
            <CardHead label="Finished recently" />
            {finishedToday.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--ws-surface-header)", borderRadius: 14, padding: 16 }}>
                <span className={s.emo} style={{ fontSize: 18 }} aria-hidden="true">
                  🕒
                </span>
                <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>Nothing finished in the last 24 hours.</span>
              </div>
            ) : (
              finishedToday.map((item, i) => {
                const creator = creatorById.get(item.creatorId);
                return (
                  <div key={`${item.creatorId}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ws-accent)", flex: "none" }} />
                    <span style={{ fontSize: 14, flex: 1, minWidth: 0 }}>
                      <b>{creator?.displayName ?? `@${item.handle}`}</b> <span style={{ color: "var(--ws-ink-60)" }}>{item.label}</span>
                    </span>
                    <span style={{ fontSize: 12, color: "var(--ws-ink-45)", whiteSpace: "nowrap" }}>{item.relativeTime}</span>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>
    </AppMain>
  );
}
