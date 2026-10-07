import type { Job } from "./data";

// Failed pulls are grouped by cause, not listed per job: thirty pulls that
// all died on the same Apify limit are one problem, not thirty.
export type PullFailureKind = "limit" | "token" | "other";

export type PullFailureGroup = {
  key: string;
  kind: PullFailureKind;
  title: string;
  jobs: Job[];
  // Unique creators affected, by id, in first-seen order.
  creatorIds: string[];
  raw: string;
};

function classify(error: string): { kind: PullFailureKind; title: string } {
  if (/monthly usage|usage limit|limit reached|exceed|quota|hard limit/i.test(error)) {
    return { kind: "limit", title: "Apify monthly usage limit reached" };
  }
  if (/token|unauthori[sz]ed|\b401\b|\b403\b|invalid.*(key|credential)/i.test(error)) {
    return { kind: "token", title: "Apify token was rejected" };
  }
  const firstLine = error.split("\n")[0].trim();
  return { kind: "other", title: firstLine.length > 90 ? `${firstLine.slice(0, 87)}…` : firstLine || "Pull failed" };
}

export function groupPullFailures(jobs: Job[]): PullFailureGroup[] {
  const groups = new Map<string, PullFailureGroup>();
  for (const job of jobs) {
    if (job.state !== "failed") continue;
    const raw = job.error?.trim() || "Pull failed";
    const { kind, title } = classify(raw);
    // Known causes group together regardless of wording; unknown ones group by exact text.
    const key = kind === "other" ? `other:${raw}` : kind;
    const existing = groups.get(key);
    if (existing) {
      existing.jobs.push(job);
      if (job.creatorId && !existing.creatorIds.includes(job.creatorId)) existing.creatorIds.push(job.creatorId);
    } else {
      groups.set(key, { key, kind, title, jobs: [job], creatorIds: job.creatorId ? [job.creatorId] : [], raw });
    }
  }
  return [...groups.values()].sort((a, b) => b.jobs.length - a.jobs.length);
}

// Pulls count as paused when a limit/token failure is newer than the last
// successful pull and nothing is running — the situation where nothing new
// will arrive until the user acts.
export function pullsPaused(jobs: Job[], lastFinishedIso: string | null): PullFailureGroup | null {
  if (jobs.some((j) => j.state === "running")) return null;
  const blocking = groupPullFailures(jobs).filter((g) => g.kind !== "other");
  for (const group of blocking) {
    const newest = group.jobs.reduce((max, j) => (j.atIso && j.atIso > max ? j.atIso : max), "");
    if (!lastFinishedIso || newest > lastFinishedIso) return group;
  }
  return null;
}
