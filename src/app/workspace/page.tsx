import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/supabase/data";
import { WorkspacePageHeader } from "./page-header";
import { PRODUCTS, USAGE, PLAN } from "./data";

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

function deriveFirstName(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const first = localPart.split(/[._-]/).filter(Boolean)[0];
  return first ? first[0].toUpperCase() + first.slice(1) : "there";
}

export default async function OverviewPage() {
  const user = await getUser();
  const firstName = deriveFirstName(user?.email ?? "");
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="ws-page-in">
      <WorkspacePageHeader
        title={`${greeting()}, ${firstName}`}
        subtitle={`${today} · 7 new outliers and 12 failing assets since you last looked`}
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
              {product.stats.map((stat) => (
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
                {product.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="ws-card mx-6 mb-[30px] mt-[14px] flex flex-wrap items-center gap-[22px]"
        style={{ padding: "18px 22px" }}
      >
        <div className="shrink-0">
          <p className="ws-eyebrow" style={{ marginBottom: 10 }}>
            STUDIO PLAN
          </p>
          <p
            className="whitespace-nowrap text-[12.5px] font-medium"
            style={{ color: "var(--ws-ink)" }}
          >
            ${PLAN.price} / month · renews {PLAN.renewsOn}
          </p>
        </div>

        <div
          className="hidden h-[52px] w-px shrink-0 sm:block"
          style={{ background: "var(--ws-hairline)" }}
        />

        {USAGE.map((item) => {
          const pct = Math.min(100, (item.used / item.limit) * 100);
          const nearLimit = pct >= 90;
          return (
            <div key={item.key} className="flex min-w-[140px] flex-1 flex-col gap-[7px]">
              <p
                className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px]"
                style={{ color: "var(--ws-ink-60)" }}
              >
                {item.shortLabel}
              </p>
              <p
                className="ws-tabular whitespace-nowrap text-[12.5px] font-medium"
                style={{ color: "var(--ws-ink)" }}
              >
                {item.used.toLocaleString()} / {item.limit.toLocaleString()}
              </p>
              <div
                className="mt-[2px] h-[3px] overflow-hidden rounded-[20px]"
                style={{ background: "var(--ws-hairline)" }}
              >
                <div
                  className="h-full rounded-[20px]"
                  style={{
                    width: `${pct}%`,
                    background: nearLimit ? "var(--ws-warn)" : "var(--ws-accent)",
                  }}
                />
              </div>
            </div>
          );
        })}

        <div
          className="hidden h-[52px] w-px shrink-0 sm:block"
          style={{ background: "var(--ws-hairline)" }}
        />

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
