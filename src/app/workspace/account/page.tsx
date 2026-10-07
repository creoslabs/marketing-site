import type { Metadata } from "next";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";
import { getJobs } from "@/app/outlier/live-data";
import { pullsPaused } from "@/app/outlier/pull-errors";
import { AppMain, PageHeader, Avatar, Mono, appStyles as s } from "@/components/app/ui";
import { SettingsRow, SettingsSection } from "@/components/app/settings";
import { AddTimezoneButton, AvatarUploadButton, DeleteAccountButton } from "./account-actions";
import { SignOutOthersButton } from "./sign-out-others-button";
import { EditableNameRow, EditableEmailRow, EditablePasswordRow, EditableApiKeyRow } from "./editable-fields";
import { NotificationPreferences } from "./notification-preferences";

export const metadata: Metadata = {
  title: "Account — Creos Labs",
  robots: { index: false, follow: false },
};

function providerLabel(user: Awaited<ReturnType<typeof getUser>>): string {
  const provider = user?.app_metadata?.provider;
  if (!provider || provider === "email") return "Email and password";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
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
  const { jobs, finished } = await getJobs();
  const paused = pullsPaused(jobs, finished[0]?.finishedAtIso ?? null);

  const email = user?.email ?? "";
  const name = getDisplayName(user);
  const isEmailProvider = !user?.app_metadata?.provider || user.app_metadata.provider === "email";
  const hasKey = (k: string) => Boolean(typeof user?.user_metadata?.[k] === "string" && user.user_metadata[k]);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppMain>
      <PageHeader
        eyebrow={`Account · ${name}`}
        line1="Your account."
        line2="Across every tool."
        sub="One login for Outlier, Signal and whatever comes out of the lab next."
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <SettingsSection title="Profile" description="Your name and how we identify you across Outlier and Signal.">
          <EditableNameRow initialValue={name} />
          <SettingsRow label="Avatar" action={<AvatarUploadButton />}>
            <Avatar initials={(initials || "?").slice(0, 1)} size={32} paper />
          </SettingsRow>
          <SettingsRow label="Time zone" muted action={<AddTimezoneButton />}>
            Not set
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Security" description="How you sign in, and where you’re signed in from.">
          <SettingsRow label="Sign-in method">{providerLabel(user)}</SettingsRow>
          <EditableEmailRow initialValue={email} />
          {isEmailProvider && <EditablePasswordRow />}
          <SettingsRow label="Sessions" action={<SignOutOthersButton />}>
            This device
          </SettingsRow>
        </SettingsSection>

        <SettingsSection
          title="API keys"
          description="Only used by your own account. Lets you run Outlier and Signal before the server has its own keys."
        >
          <EditableApiKeyRow label="Anthropic API key" metaKey="signal_anthropic_api_key" initialIsSet={hasKey("signal_anthropic_api_key")} placeholder="sk-ant-…" />
          <EditableApiKeyRow
            label="Apify API token"
            metaKey="outlier_apify_api_key"
            initialIsSet={hasKey("outlier_apify_api_key")}
            placeholder="apify_api_…"
            problem={paused ? (paused.kind === "limit" ? "Limit reached" : "Token rejected") : undefined}
          />
          <EditableApiKeyRow label="Groq API key" metaKey="outlier_groq_api_key" initialIsSet={hasKey("outlier_groq_api_key")} placeholder="gsk_…" />
        </SettingsSection>

        <SettingsSection title="Email notifications" description="Choose what Outlier and Signal can email you about.">
          <NotificationPreferences initialDisabled={disabledNotifications} />
        </SettingsSection>
      </div>

      <div className={s.dangerPanel}>
        <div className={s.dangerText}>
          <Mono style={{ fontSize: 11, color: "var(--ws-warn)" }}>Delete account</Mono>
          <span>This can’t be undone. We’ll email a copy of your data before it’s deleted.</span>
        </div>
        <DeleteAccountButton />
      </div>
    </AppMain>
  );
}
