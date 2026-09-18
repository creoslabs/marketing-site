import type { Metadata } from "next";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { WorkspacePageHeader } from "../page-header";
import { getCreators, getPosts } from "@/app/outlier/live-data";
import { getSignalSummary } from "@/app/signal/live-data";
import { EmptyState } from "@/components/ws-empty-state";
import { ChoosePlanButton, AddPaymentButton } from "../billing-actions";

export const metadata: Metadata = {
  title: "Billing — Creos Labs",
  robots: { index: false, follow: false },
};

export default async function BillingPage() {
  const [user, signalSummary, creators, posts] = await Promise.all([
    getUser(),
    getSignalSummary(),
    getCreators(),
    getPosts(),
  ]);
  const email = user?.email ?? "";
  const billedTo = getDisplayName(user);

  const usage = [
    { key: "creators", label: "Creators tracked", value: creators.length },
    { key: "posts", label: "Posts pulled", value: posts.length },
    { key: "assets", label: "Assets analyzed", value: signalSummary.total },
    { key: "failing", label: "Assets failing a check", value: signalSummary.failing },
  ];

  return (
    <div className="ws-page-in">
      <WorkspacePageHeader title="Billing" subtitle="No active plan" />

      <div className="grid grid-cols-1 gap-[14px] px-6 pb-[30px] pt-[22px] lg:grid-cols-[1fr_372px]">
        {/* Left column */}
        <div className="flex flex-col gap-[14px]">
          <div className="ws-card" style={{ padding: "20px 22px 22px" }}>
            <p className="ws-eyebrow" style={{ marginBottom: 18 }}>USAGE</p>
            <div className="grid grid-cols-1 gap-x-[26px] gap-y-[16px] sm:grid-cols-2">
              {usage.map((item) => (
                <div key={item.key} className="flex items-center">
                  <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {item.label}
                  </span>
                  <div className="flex-1" />
                  <span className="ws-tabular text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 22px 22px" }}>
            <p className="ws-eyebrow" style={{ marginBottom: 15 }}>INVOICES</p>
            <EmptyState title="No invoices yet" description="Invoices will appear here once you're on a paid plan." />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-[14px]">
          <div
            className="rounded-[10px]"
            style={{
              padding: "20px 22px 22px",
              background: "var(--ws-accent-tint)",
              border: "1px solid var(--ws-accent-tint-border)",
              color: "var(--ws-accent-tint-ink)",
            }}
          >
            <p className="ws-eyebrow" style={{ marginBottom: 14, color: "var(--ws-accent-tint-ink)" }}>
              CURRENT PLAN
            </p>
            <span className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-accent-tint-ink)" }}>
              No active plan
            </span>
            <p className="mt-[11px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-accent-tint-ink)" }}>
              Choose a plan to unlock Outlier and Signal beyond what&apos;s tracked above.
            </p>
            <div className="mt-[17px] flex gap-[8px]">
              <ChoosePlanButton />
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 22px 22px" }}>
            <p className="ws-eyebrow" style={{ marginBottom: 15 }}>PAYMENT METHOD</p>
            <div className="flex items-center gap-[13px]">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                  No payment method on file
                </p>
              </div>
              <AddPaymentButton />
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 22px 22px" }}>
            <p className="ws-eyebrow" style={{ marginBottom: 15 }}>BILLING DETAILS</p>
            <div className="flex flex-col gap-[12px]">
              <div className="flex">
                <span className="w-[96px] shrink-0 text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                  Billed to
                </span>
                <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                  {billedTo}
                </span>
              </div>
              <div className="flex">
                <span className="w-[96px] shrink-0 text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                  Email
                </span>
                <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                  {email || "—"}
                </span>
              </div>
              <div className="flex">
                <span className="w-[96px] shrink-0 text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
                  VAT
                </span>
                <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                  Not provided
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
