import type { Metadata } from "next";
import { getJobs, getCreators } from "../live-data";
import { Avatar, EmptyState, ProgressBar } from "../components";

export const metadata: Metadata = {
  title: "Progress — Outlier",
  robots: { index: false, follow: false },
};

export default async function ProgressPage() {
  const [{ jobs, finished }, creators] = await Promise.all([getJobs(), getCreators()]);
  const creatorById = new Map(creators.map((c) => [c.id, c]));

  const running = jobs.filter((job) => job.state === "running");
  const queued = jobs.filter((job) => job.state === "queued");
  const failed = jobs.filter((job) => job.state === "failed");

  if (jobs.length === 0 && finished.length === 0) {
    return (
      <div className="ws-page-in flex min-h-[70vh] items-center justify-center px-6 py-[22px]">
        <EmptyState
          size="large"
          title="Nothing to show yet"
          description="Once you pull a creator's posts, pulls and analysis jobs will show up here."
        />
      </div>
    );
  }

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            Progress
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            {running.length} running · {queued.length} queued · {failed.length} failed
          </p>
        </div>
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_352px]">
        <div className="flex flex-col gap-[14px]">
          {running.length === 0 && (
            <div className="ws-card">
              <EmptyState title="Nothing running right now" />
            </div>
          )}
          <div className="flex flex-col gap-[10px]">
            {running.map((job) => {
              const creator = creatorById.get(job.creatorId);
              return (
                <div key={job.id} className="ws-card" style={{ padding: "14px 16px" }}>
                  <div className="flex items-center gap-[10px]">
                    {creator && <Avatar initials={creator.initials} size={26} />}
                    <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {creator?.handles[0].handle}
                    </span>
                    <span className="text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                      {job.scope}
                    </span>
                  </div>
                  <div className="mt-[10px]">
                    <ProgressBar pct={job.pct} height={5} />
                  </div>
                  <p className="mt-[8px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                    {job.stage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-[14px]">
          {failed.length > 0 && (
          <div
            className="rounded-[10px]"
            style={{ padding: "16px 18px 18px", background: "var(--ws-warn-tint)" }}
          >
            <p className="ws-eyebrow" style={{ color: "var(--ws-warn-text)" }}>FAILED</p>
            <div className="mt-[12px] flex flex-col gap-[12px]">
              {failed.map((job) => {
                const creator = creatorById.get(job.creatorId);
                return (
                  <div key={job.id}>
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-warn-tint-ink)" }}>
                        {creator?.handles[0].handle}
                      </span>
                      <span className="text-[11.5px]" style={{ color: "var(--ws-warn-tint-ink)", opacity: 0.7 }}>
                        {job.scope}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-[1.4]" style={{ color: "var(--ws-warn-tint-ink)" }}>
                      {job.error}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          <div className="ws-card" style={{ padding: "16px 18px 18px" }}>
            <p className="ws-eyebrow">FINISHED RECENTLY</p>
            {finished.length === 0 ? (
              <div className="mt-[8px]">
                <EmptyState title="Nothing finished yet" />
              </div>
            ) : (
            <div className="mt-[12px] flex flex-col gap-[10px]">
              {finished.map((item, i) => {
                const creator = creatorById.get(item.creatorId);
                return (
                  <div key={`${item.creatorId}-${i}`} className="flex items-center gap-[8px]">
                    <span
                      className="h-[6px] w-[6px] shrink-0 rounded-full"
                      style={{ background: "var(--ws-accent)" }}
                    />
                    <span className="text-[12px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {creator?.handles[0].handle}
                    </span>
                    <span className="text-[12px]" style={{ color: "var(--ws-ink-60)" }}>
                      {item.label}
                    </span>
                    <div className="flex-1" />
                    <span className="text-[11px]" style={{ color: "var(--ws-ink-45)" }}>
                      {item.relativeTime}
                    </span>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
