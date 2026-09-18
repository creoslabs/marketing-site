import type { Metadata } from "next";
import Link from "next/link";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { WorkspacePageHeader } from "./page-header";
import { PRODUCTS } from "./data";
import { CREATORS, POSTS, JOBS } from "@/app/outlier/data";
import { getSignalSummary } from "@/app/signal/live-data";

export const metadata: Metadata = {
  title: "Overview — Creos Labs",
  robots: { index: false, follow: false },
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default async function OverviewPage() {
  const [user, signalSummary] = await Promise.all([getUser(), getSignalSummary()]);
  const firstName = getDisplayName(user).split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const outlierPosts = POSTS.filter((post) => post.score >= 2);
  const runningJobs = JOBS.filter((job) => job.state === "running");

  const statsByKey: Record<string, { label: string; value: string; warn?: boolean }[]> = {
    outlier: [
      { label: "CREATORS", value: String(CREATORS.length) },
      { label: "OUTLIERS", value: String(outlierPosts.length) },
      { label: "POSTS PULLED", value: String(POSTS.length) },
    ],
    signal: [
      { label: "ASSETS", value: String(signalSummary.total) },
      { label: "FAILING", value: String(signalSummary.failing), warn: signalSummary.failing > 0 },
      {
        label: "LAST RUN",
        value: signalSummary.lastAnalyzedAt ? relativeTime(signalSummary.lastAnalyzedAt) : "—",
      },
    ],
  };

  const statusByKey: Record<string, string> = {
    outlier: runningJobs.length > 0 ? `${runningJobs.length} jobs running` : "Idle",
    signal: "Idle",
  };

  return (
    <div className="ws-page-in">
      <WorkspacePageHeader
        title={`${greeting()}, ${firstName}`}
        subtitle={today}
      />

      <div className="grid grid-cols-1 gap-[14px] px-6 pt-[22px] sm:grid-cols-2">
        {PRODUCTS.map((product) => (
          <div
            key={product.key}
            className="ws-card flex flex-col gap-[22px]"
            style={{ padding: "26px 28px 24px" }}
          >
            <div>
              <p className="ws-eyebrow" style={{ marginBottom: 14 }}>
                {product.eyebrow}
              </p>
              <h2
                className="text-[22px] font-bold tracking-[-0.02em]"
                style={{ color: "var(--ws-ink)" }}
              >
                {product.name}
              </h2>
              <p
                className="mt-[11px] text-[13px] leading-[1.5]"
                style={{ color: "var(--ws-ink-60)", maxWidth: "40ch" }}
              >
                {product.description}
              </p>
            </div>

            <div className="flex-1" />

            <div className="ws-stack-row">
              {statsByKey[product.key].map((stat) => (
                <div key={stat.label} className="flex-1" style={{ padding: "15px 16px" }}>
                  <p className="ws-eyebrow" style={{ marginBottom: 10 }}>
                    {stat.label}
                  </p>
                  <p
                    className="ws-tabular text-[20px] font-bold tracking-[-0.03em]"
                    style={{ color: stat.warn ? "var(--ws-warn-text)" : "var(--ws-ink)" }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-[9px]">
              <Link
                href={product.openHref}
                className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
                style={{ padding: "11px 15px" }}
              >
                {product.openLabel}
              </Link>
              <Link
                href={product.secondaryHref}
                className="ws-btn-ghost rounded-[8px] text-[12.5px] font-medium"
                style={{ padding: "11px 14px" }}
              >
                {product.secondaryLabel}
              </Link>
              <div className="flex-1" />
              <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                {statusByKey[product.key]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="ws-card mx-6 mb-[30px] mt-[14px] flex flex-wrap items-center gap-[16px]"
        style={{ padding: "18px 22px" }}
      >
        <div className="shrink-0">
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>
            PLAN
          </p>
          <p className="whitespace-nowrap text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
            No plan selected
          </p>
        </div>

        <div className="hidden h-[52px] w-px shrink-0 sm:block" style={{ background: "var(--ws-hairline)" }} />

        <p className="flex-1 text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
          Usage is tracked per product above. Billing isn&apos;t set up yet.
        </p>

        <Link
          href="/workspace/billing"
          className="ws-btn-ghost shrink-0 rounded-[8px] text-[12.5px] font-medium"
          style={{ padding: "10px 14px" }}
        >
          Manage plan
        </Link>
      </div>
    </div>
  );
}
