import type { Metadata } from "next";
import { getUser } from "@/lib/supabase/data";
import { WorkspacePageHeader } from "../page-header";
import { PLAN, USAGE, INVOICES, PAYMENT_METHOD } from "../data";
import {
  ChangePlanButton,
  CancelPlanButton,
  UpdatePaymentButton,
  DownloadInvoiceButton,
  DownloadAllButton,
} from "../billing-actions";

export const metadata: Metadata = {
  title: "Billing — Creos Labs",
  robots: { index: false, follow: false },
};

export default async function BillingPage() {
  const user = await getUser();
  const email = user?.email ?? "";
  const localPart = email.split("@")[0] ?? "";
  const billedTo =
    localPart
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p[0].toUpperCase() + p.slice(1))
      .join(" ") || "—";

  return (
    <div className="ws-page-in">
      <WorkspacePageHeader
        title="Billing"
        subtitle={`${PLAN.name} plan · next charge $${PLAN.price.toFixed(2)} on ${PLAN.renewsOnFull}`}
      />

      <div
        className="grid grid-cols-1 gap-[14px] px-6 pb-[30px] pt-[22px] lg:grid-cols-[1fr_372px]"
      >
        {/* Left column */}
        <div className="flex flex-col gap-[14px]">
          <div className="ws-card" style={{ padding: "20px 22px 22px" }}>
            <div className="mb-[18px] flex items-center">
              <p className="ws-eyebrow">USAGE THIS PERIOD</p>
              <div className="flex-1" />
              <span className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                {PLAN.periodLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-[26px] gap-y-[20px] sm:grid-cols-2">
              {USAGE.map((item) => {
                const pct = Math.min(100, (item.used / item.limit) * 100);
                const nearLimit = pct >= 90;
                return (
                  <div key={item.key}>
                    <div className="flex items-center">
                      <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                        {item.label}
                      </span>
                      <div className="flex-1" />
                      <span
                        className="ws-tabular text-[12.5px] font-medium"
                        style={{ color: "var(--ws-ink)" }}
                      >
                        {item.used.toLocaleString()} / {item.limit.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="my-[10px] h-[4px] overflow-hidden rounded-[20px]"
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
                    <p className="text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                      {item.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 22px 22px" }}>
            <div className="mb-[15px] flex items-center">
              <p className="ws-eyebrow">INVOICES</p>
              <div className="flex-1" />
              <DownloadAllButton />
            </div>

            <div className="ws-stack">
              <div
                className="grid items-center"
                style={{
                  gridTemplateColumns: "1fr 130px 90px 60px",
                  gap: 14,
                  padding: "11px 16px",
                  background: "var(--ws-surface-header)",
                }}
              >
                <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>DATE</span>
                <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>PERIOD</span>
                <span className="ws-eyebrow" style={{ color: "var(--ws-ink-45)" }}>AMOUNT</span>
                <span className="ws-eyebrow text-right" style={{ color: "var(--ws-ink-45)" }}>PDF</span>
              </div>

              {INVOICES.map((invoice) => (
                <div
                  key={invoice.id}
                  className="ws-row-hover grid items-center"
                  style={{ gridTemplateColumns: "1fr 130px 90px 60px", gap: 14, padding: "13px 16px" }}
                >
                  <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {invoice.date}
                  </span>
                  <span className="text-[11.5px]" style={{ color: "var(--ws-ink-60)" }}>
                    {invoice.period}
                  </span>
                  <span
                    className="ws-tabular text-[12.5px] font-medium"
                    style={{ color: "var(--ws-ink)" }}
                  >
                    {invoice.amount}
                  </span>
                  <div className="text-right">
                    <DownloadInvoiceButton />
                  </div>
                </div>
              ))}
            </div>
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
            <div className="flex items-baseline gap-[8px]">
              <span className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-accent-tint-ink)" }}>
                {PLAN.name}
              </span>
              <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-accent-tint-ink)" }}>
                ${PLAN.price} / month
              </span>
            </div>
            <p className="mt-[11px] text-[13px] leading-[1.5]" style={{ color: "var(--ws-accent-tint-ink)" }}>
              Both products, 25 creators, 5,000 posts and 150 ad analyses a month.
            </p>
            <div className="mt-[17px] flex gap-[8px]">
              <ChangePlanButton />
              <CancelPlanButton />
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 22px 22px" }}>
            <p className="ws-eyebrow" style={{ marginBottom: 15 }}>PAYMENT METHOD</p>
            <div className="flex items-center gap-[13px]">
              <div
                className="ws-placeholder shrink-0 rounded-[5px]"
                style={{ width: 40, height: 26, border: "1px solid var(--ws-hairline)" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                  {PAYMENT_METHOD.brand} ending {PAYMENT_METHOD.last4}
                </p>
                <p className="mt-[6px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
                  Expires {PAYMENT_METHOD.expMonth} / {PAYMENT_METHOD.expYear}
                </p>
              </div>
              <UpdatePaymentButton />
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
