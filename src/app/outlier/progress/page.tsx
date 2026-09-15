import type { Metadata } from "next";
import { JOBS, FINISHED_RECENTLY, SETTINGS, getCreator } from "../data";
import { Avatar, ProgressBar } from "../components";

export const metadata: Metadata = {
  title: "Progress — Outlier",
  robots: { index: false, follow: false },
};

const STAGES = ["Pull metadata", "Download", "Transcribe", "Score", "Trend match"];

export default function ProgressPage() {
  const running = JOBS.filter((job) => job.state === "running");
  const queued = JOBS.filter((job) => job.state === "queued");
  const failed = JOBS.filter((job) => job.state === "failed");

  return (
    <div className="ws-page-in px-6 py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
            Progress
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
            {running.length} running · {queued.length} queued · {failed.length} failed · 41 posts scored
            in the last hour
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <button
            type="button"
            className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
            style={{ padding: "10px 14px" }}
          >
            Pause all
          </button>
          <button
            type="button"
            className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
            style={{ padding: "10px 14px" }}
          >
            Retry failed
          </button>
        </div>
      </div>

      <div className="ws-card mt-[18px] flex flex-wrap items-center gap-[10px]" style={{ padding: "16px 20px" }}>
        <p className="ws-eyebrow" style={{ marginRight: 6 }}>PIPELINE</p>
        {STAGES.map((stage, i) => (
          <div key={stage} className="flex items-center gap-[10px]">
            {i > 0 && <span style={{ color: "var(--ws-ink-45)" }}>→</span>}
            <span
              className="rounded-[7px] text-[12px] font-medium"
              style={{
                padding: "6px 10px",
                background: "var(--ws-surface-header)",
                color: "var(--ws-ink-60)",
              }}
            >
              {stage}
            </span>
          </div>
        ))}
        <div className="flex-1" />
        <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
          2 downloads in parallel
        </span>
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_352px]">
        <div className="flex flex-col gap-[14px]">
          <div className="flex flex-col gap-[10px]">
            {running.map((job) => {
              const creator = getCreator(job.creatorId);
              return (
                <div key={job.id} className="ws-card" style={{ padding: "14px 16px" }}>
                  <div className="flex items-center gap-[10px]">
                    <Avatar initials={creator.initials} size={26} />
                    <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {creator.handles[0].handle}
                    </span>
                    <span className="text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                      {job.scope}
                    </span>
                    <div className="flex-1" />
                    <span className="ws-tabular text-[17px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {job.pct}%
                    </span>
                    <button
                      type="button"
                      className="ws-btn-ghost rounded-[7px] text-[11.5px] font-medium"
                      style={{ padding: "6px 10px" }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="mt-[10px]">
                    <ProgressBar pct={job.pct} height={5} />
                  </div>
                  <p className="mt-[8px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                    {job.stage} · {job.eta}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="ws-card" style={{ padding: "16px 0 6px" }}>
            <p className="ws-eyebrow px-[16px]">{queued.length} waiting · drag to reorder</p>
            <div className="ws-stack mt-[12px]" style={{ border: "none", borderRadius: 0 }}>
              {queued.map((job, i) => {
                const creator = getCreator(job.creatorId);
                return (
                  <div key={job.id} className="flex items-center gap-[12px]" style={{ padding: "12px 16px" }}>
                    <span className="ws-tabular w-[16px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                      {i + 1}
                    </span>
                    <Avatar initials={creator.initials} size={24} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                        {creator.handles[0].handle} · {job.scope}
                      </p>
                      <p className="truncate text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                        {job.waitReason}
                      </p>
                    </div>
                    <button type="button" style={{ color: "var(--ws-ink-45)" }} aria-label="Remove">
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[14px]">
          <div
            className="rounded-[10px]"
            style={{ padding: "16px 18px 18px", background: "var(--ws-warn-tint)" }}
          >
            <p className="ws-eyebrow" style={{ color: "var(--ws-warn-text)" }}>FAILED</p>
            <div className="mt-[12px] flex flex-col gap-[12px]">
              {failed.map((job) => {
                const creator = getCreator(job.creatorId);
                return (
                  <div key={job.id}>
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-warn-tint-ink)" }}>
                        {creator.handles[0].handle}
                      </span>
                      <span className="text-[11.5px]" style={{ color: "var(--ws-warn-tint-ink)", opacity: 0.7 }}>
                        {job.scope}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-[1.4]" style={{ color: "var(--ws-warn-tint-ink)" }}>
                      {job.error}
                    </p>
                    <button
                      type="button"
                      className="mt-[8px] text-[11.5px] font-medium"
                      style={{ color: "var(--ws-warn-text)" }}
                    >
                      Retry
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ws-card" style={{ padding: "16px 18px 18px" }}>
            <p className="ws-eyebrow">FINISHED RECENTLY</p>
            <div className="mt-[12px] flex flex-col gap-[10px]">
              {FINISHED_RECENTLY.map((item) => {
                const creator = getCreator(item.creatorId);
                return (
                  <div key={item.label} className="flex items-center gap-[8px]">
                    <span
                      className="h-[6px] w-[6px] shrink-0 rounded-full"
                      style={{ background: "var(--ws-accent)" }}
                    />
                    <span className="text-[12px] font-medium" style={{ color: "var(--ws-ink)" }}>
                      {creator.handles[0].handle}
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
          </div>

          <div className="ws-card" style={{ padding: "16px 18px 18px" }}>
            <p className="ws-eyebrow">SETTINGS</p>
            <div className="mt-[12px] flex flex-col gap-[10px] text-[12.5px]" style={{ color: "var(--ws-ink)" }}>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--ws-ink-60)" }}>Auto-pull every</span>
                <span className="font-medium">{SETTINGS.autoPullHours} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--ws-ink-60)" }}>Transcribe on</span>
                <span className="font-medium">{SETTINGS.transcribeThreshold}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--ws-ink-60)" }}>Keep video files</span>
                <span className="font-medium">{SETTINGS.retainVideoDays} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
