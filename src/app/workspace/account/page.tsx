import type { Metadata } from "next";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";
import { WorkspacePageHeader } from "../page-header";
import { ConnectButton, DeleteAccountButton } from "./account-actions";
import { EditableNameRow, EditableEmailRow, EditablePasswordRow, EditableApiKeyRow } from "./editable-fields";
import { NotificationPreferences } from "./notification-preferences";

export const metadata: Metadata = {
  title: "Account — Creos Labs",
  robots: { index: false, follow: false },
};

function Row({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center" style={{ padding: "16px 22px" }}>
      <span className="w-[120px] shrink-0 text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
        {label}
      </span>
      <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
        {value}
      </span>
      <div className="flex-1" />
      {action}
    </div>
  );
}

export default async function AccountPage() {
  const user = await getUser();
  let disabledNotifications: string[] = [];
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("notification_preferences").select("categories").eq("user_id", user.id).maybeSingle();
    const categories = (data?.categories as Record<string, boolean>) ?? {};
    disabledNotifications = Object.entries(categories)
      .filter(([, enabled]) => enabled === false)
      .map(([key]) => key);
  }
  const email = user?.email ?? "";
  const name = getDisplayName(user);
  const hasAnthropicKey = Boolean(
    typeof user?.user_metadata?.signal_anthropic_api_key === "string" && user.user_metadata.signal_anthropic_api_key
  );
  const hasApifyKey = Boolean(
    typeof user?.user_metadata?.outlier_apify_api_key === "string" && user.user_metadata.outlier_apify_api_key
  );
  const hasGroqKey = Boolean(
    typeof user?.user_metadata?.outlier_groq_api_key === "string" && user.user_metadata.outlier_groq_api_key
  );
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="ws-page-in">
      <WorkspacePageHeader title="Account" subtitle="Profile, sign-in and connected platforms." />

      <div className="grid grid-cols-1 gap-[14px] px-6 pb-[30px] pt-[22px] lg:grid-cols-[1fr_372px]">
        <div className="flex flex-col gap-[14px]">
          <div className="ws-card" style={{ padding: "20px 0" }}>
            <p className="ws-eyebrow" style={{ padding: "0 22px", marginBottom: 15 }}>
              PROFILE
            </p>
            <div className="ws-stack" style={{ border: "none", borderRadius: 0 }}>
              <EditableNameRow initialValue={name} />
              <Row
                label="Avatar"
                value=""
                action={
                  <span
                    className="ws-placeholder flex h-[26px] w-[26px] items-center justify-center rounded-full text-[9.5px] font-semibold"
                    style={{ color: "var(--ws-ink-60)", border: "1px solid var(--ws-hairline)" }}
                  >
                    {initials || "?"}
                  </span>
                }
              />
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 0" }}>
            <p className="ws-eyebrow" style={{ padding: "0 22px", marginBottom: 15 }}>
              SIGN-IN
            </p>
            <div className="ws-stack" style={{ border: "none", borderRadius: 0 }}>
              <EditableEmailRow initialValue={email} />
              <EditablePasswordRow />
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 0" }}>
            <div style={{ padding: "0 22px", marginBottom: 15 }}>
              <p className="ws-eyebrow">TESTING · API KEYS</p>
              <p className="mt-[8px] text-[11.5px] leading-[1.4]" style={{ color: "var(--ws-ink-45)" }}>
                Only used by your own account, never shared. Setting these here skips configuring server
                env vars while testing — remove them once the server has its own keys configured. Anthropic
                powers Signal&apos;s scoring and Outlier&apos;s structure analysis; Apify powers Outlier&apos;s
                creator pulls; Groq transcribes video audio for Outlier.
              </p>
            </div>
            <div className="ws-stack" style={{ border: "none", borderRadius: 0 }}>
              <EditableApiKeyRow
                label="Anthropic API key"
                metaKey="signal_anthropic_api_key"
                initialIsSet={hasAnthropicKey}
                placeholder="sk-ant-…"
              />
              <EditableApiKeyRow
                label="Apify API token"
                metaKey="outlier_apify_api_key"
                initialIsSet={hasApifyKey}
                placeholder="apify_api_…"
              />
              <EditableApiKeyRow
                label="Groq API key"
                metaKey="outlier_groq_api_key"
                initialIsSet={hasGroqKey}
                placeholder="gsk_…"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[14px]">
          <div className="ws-card" style={{ padding: "20px 22px 22px" }}>
            <p className="ws-eyebrow" style={{ marginBottom: 15 }}>
              CONNECTED PLATFORMS
            </p>
            <div className="ws-stack">
              {[
                { name: "Instagram", status: "Not connected" },
                { name: "TikTok", status: "Not connected" },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center"
                  style={{ padding: "13px 16px" }}
                >
                  <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
                    {platform.name}
                  </span>
                  <div className="flex-1" />
                  <span
                    className="mr-[10px] text-[11.5px]"
                    style={{ color: "var(--ws-ink-45)" }}
                  >
                    {platform.status}
                  </span>
                  <ConnectButton />
                </div>
              ))}
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 0" }}>
            <p className="ws-eyebrow" style={{ padding: "0 22px", marginBottom: 15 }}>
              NOTIFICATIONS
            </p>
            <NotificationPreferences initialDisabled={disabledNotifications} />
          </div>

          <div
            className="rounded-[10px]"
            style={{ padding: "20px 22px 22px", border: "1px solid var(--ws-hairline)" }}
          >
            <p className="ws-eyebrow" style={{ marginBottom: 11, color: "var(--ws-warn-text)" }}>
              DANGER ZONE
            </p>
            <p className="text-[13px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
              Permanently delete your account and all associated data.
            </p>
            <div className="mt-[15px]">
              <DeleteAccountButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
