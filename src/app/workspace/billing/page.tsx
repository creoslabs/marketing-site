import type { Metadata } from "next";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { EmptyState } from "@/components/ws-empty-state";
import { WorkspaceHero } from "../workspace-hero";
import { ChoosePlanButton, AddPaymentButton, TalkToUsForTeamsLink } from "../billing-actions";

export const metadata: Metadata = {
  title: "Billing — Creos Labs",
  robots: { index: false, follow: false },
};

const INCLUDED = [
  { key: "Outlier", body: "Content intelligence" },
  { key: "Signal", body: "Creative analysis" },
  { key: "???", body: "Something new is forming in the lab" },
];

export default async function BillingPage() {
  const user = await getUser();
  const email = user?.email ?? "";
  const billedTo = getDisplayName(user);

  return (
    <div className="ws-page-in">
      <WorkspaceHero
        eyebrow="Billing / Founding access"
        line1="One subscription."
        line2="Every tool."
        sub="Founding access is A$15/month once it's open — no lock-in, cancel anytime."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 14, padding: "36px 28px 0" }}>
        <div
          style={{
            background: "var(--ws-accent-tint)",
            border: "1px solid var(--ws-accent-tint-border)",
            borderRadius: 10,
            padding: "26px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div className="flex items-end" style={{ gap: 20 }}>
            <div style={{ flex: 1 }}>
              <p className="ws-eyebrow" style={{ marginBottom: 16, color: "var(--ws-accent-tint-ink)" }}>
                Your plan
              </p>
              <p
                className="ws-tabular"
                style={{ margin: 0, fontSize: 52, lineHeight: 0.85, fontWeight: 700, letterSpacing: "-0.035em", color: "var(--ws-accent-tint-ink)" }}
              >
                A$15<span style={{ fontSize: 20, letterSpacing: 0 }}> / month</span>
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--ws-accent-tint-ink)", maxWidth: "30ch", textAlign: "right" }}>
              Your founding price stays yours once you subscribe.
            </p>
          </div>

          <div
            className="flex flex-col overflow-hidden"
            style={{ gap: 1, background: "var(--ws-accent-tint-border)", border: "1px solid var(--ws-accent-tint-border)", borderRadius: 8 }}
          >
            {INCLUDED.map((item) => (
              <div key={item.key} className="flex items-center" style={{ gap: 14, background: "var(--ws-accent-tint)", padding: "13px 16px" }}>
                <div style={{ width: 70, flex: "none", fontSize: 12.5, fontWeight: 600, color: "var(--ws-accent-tint-ink)" }}>
                  {item.key}
                </div>
                <div style={{ flex: 1, fontSize: 12.5, color: "var(--ws-accent-tint-ink)" }}>{item.body}</div>
                <p className="ws-eyebrow" style={{ color: "var(--ws-accent-tint-ink)" }}>
                  Included
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center" style={{ gap: 9 }}>
            <ChoosePlanButton />
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: 14 }}>
          <div className="ws-card" style={{ padding: "22px 24px" }}>
            <p className="ws-eyebrow" style={{ marginBottom: 16 }}>
              Payment method
            </p>
            <div className="flex items-center" style={{ gap: 13 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: "var(--ws-ink)" }}>No payment method on file</p>
              </div>
              <AddPaymentButton />
            </div>
          </div>

          <div className="ws-card" style={{ padding: "22px 24px", flex: 1 }}>
            <p className="ws-eyebrow" style={{ marginBottom: 16 }}>
              Billing details
            </p>
            <div className="flex flex-col" style={{ gap: 13 }}>
              <div className="flex items-baseline" style={{ gap: 12 }}>
                <div style={{ width: 84, flex: "none", fontSize: 12.5, color: "var(--ws-ink-60)" }}>Billed to</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ws-ink)" }}>{billedTo}</div>
              </div>
              <div className="flex items-baseline" style={{ gap: 12 }}>
                <div style={{ width: 84, flex: "none", fontSize: 12.5, color: "var(--ws-ink-60)" }}>Email</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ws-ink)" }}>{email || "—"}</div>
              </div>
              <div className="flex items-baseline" style={{ gap: 12 }}>
                <div style={{ width: 84, flex: "none", fontSize: 12.5, color: "var(--ws-ink-60)" }}>ABN</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ws-ink)" }}>Not provided</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 28px 0" }}>
        <div className="ws-card" style={{ padding: "22px 24px" }}>
          <div className="flex items-baseline" style={{ gap: 10, marginBottom: 16 }}>
            <p className="ws-eyebrow">Invoices</p>
          </div>
          <EmptyState title="No invoices yet" description="Invoices will appear here once you're on a paid plan." />
        </div>
      </div>

      <div
        className="flex items-center"
        style={{ gap: 14, margin: "36px 28px 0", padding: "18px 0 28px", borderTop: "1px solid var(--ws-hairline)" }}
      >
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--ws-ink-60)" }}>
          Running Creos for multiple brands? We&rsquo;re working with selected teams and agencies.
        </p>
        <div className="flex-1" />
        <TalkToUsForTeamsLink />
      </div>
    </div>
  );
}
