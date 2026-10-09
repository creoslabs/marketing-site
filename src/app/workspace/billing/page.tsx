import type { Metadata } from "next";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { AppMain, Card, CardHead, Chip, Emoji, PageHeader, appStyles as s } from "@/components/app/ui";
import { AddPaymentButton, EditBillingButton } from "../billing-actions";

export const metadata: Metadata = {
  title: "Billing — Creos Labs",
  robots: { index: false, follow: false },
};

const INCLUDED = [
  { emoji: "🔭", name: "Outlier", body: "Content intelligence" },
  { emoji: "🎯", name: "Signal", body: "Creative analysis" },
  { emoji: "🧪", name: "???", body: "Something new is forming in the lab" },
];

const detailRow: React.CSSProperties = { display: "flex", gap: 16, fontSize: 14 };

export default async function BillingPage() {
  const user = await getUser();
  const email = user?.email ?? "";
  const billedTo = getDisplayName(user);

  return (
    <AppMain>
      <PageHeader
        eyebrow="Billing · Early access"
        line1="Early access."
        line2="Every tool."
        sub="You’re in the early-access group. Billing isn’t open yet, and we’ll tell you before anything changes."
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
        <div style={{ flex: "1 1 620px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <Card paper ring style={{ padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span className={s.mono} style={{ fontSize: 10, color: "#55534d" }}>
                  Your access
                </span>
                <span className={s.disp} style={{ fontSize: 56, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
                  Early access
                </span>
              </div>
              <Chip variant="white">By invitation</Chip>
            </div>
            <p style={{ margin: 0, fontSize: 15, color: "#46443f" }}>You have access to every tool while we test. Nothing is charged, and we’ll give you notice before that changes.</p>
            <div>
              {INCLUDED.map((item) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid #dad7cf" }}>
                  <span className={s.emo} style={{ width: 40, height: 40, flex: "none", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }} aria-hidden="true">
                    {item.emoji}
                  </span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className={s.disp} style={{ fontSize: 16, letterSpacing: 0 }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: 13, color: "#55534d" }}>{item.body}</span>
                  </div>
                  <Chip variant="ink">Early access</Chip>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <CardHead label="Payment method" />
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Emoji size={22}>💳</Emoji>
              <span style={{ flex: 1, fontSize: 14, color: "var(--ws-ink-60)" }}>No payment method on file.</span>
              <AddPaymentButton />
            </div>
          </Card>
          <Card>
            <CardHead label="Billing details" right={<EditBillingButton />} />
            <div style={detailRow}>
              <span style={{ width: 90, color: "var(--ws-ink-45)" }}>Billed to</span>
              <span>{billedTo}</span>
            </div>
            <div style={detailRow}>
              <span style={{ width: 90, color: "var(--ws-ink-45)" }}>Email</span>
              <span>{email || "—"}</span>
            </div>
            <div style={detailRow}>
              <span style={{ width: 90, color: "var(--ws-ink-45)" }}>ABN</span>
              <span style={{ color: "var(--ws-ink-45)" }}>Not provided</span>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHead label="Invoices" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", textAlign: "center" }}>
          <Emoji size={34}>🧾</Emoji>
          <span style={{ fontSize: 16, fontWeight: 700 }}>No invoices yet</span>
          <span style={{ fontSize: 14, color: "var(--ws-ink-45)" }}>Invoices will appear here if paid plans are introduced.</span>
        </div>
      </Card>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, paddingTop: 20, borderTop: "1px solid var(--ws-hairline)" }}>
        <div style={{ display: "flex" }} aria-hidden="true">
          {["👩🏻", "🧔🏾", "👩🏼‍🦰"].map((p, i) => (
            <span key={i} className={s.emo} style={{ width: 34, height: 34, flex: "none", marginLeft: i ? -8 : 0, borderRadius: "50%", background: "var(--ws-paper)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {p}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 14, color: "var(--ws-ink-60)" }}>Running Creos for multiple brands? We’re working with selected teams and agencies.</span>
        <a href="mailto:hello@creos-labs.com?subject=Creos%20for%20teams" style={{ marginLeft: "auto", fontSize: 14, fontWeight: 600 }}>
          Talk to us →
        </a>
      </div>
    </AppMain>
  );
}
