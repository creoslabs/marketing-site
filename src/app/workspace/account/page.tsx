import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";
import { WsHero as WorkspaceHero } from "@/components/ws-hero";
import { WsRow } from "@/components/ws-row";
import { ConnectButton, DeleteAccountButton, AddTimezoneButton } from "./account-actions";
import { SignOutOthersButton } from "./sign-out-others-button";
import { EditableNameRow, EditableEmailRow, EditablePasswordRow, EditableApiKeyRow } from "./editable-fields";
import { NotificationPreferences } from "./notification-preferences";

export const metadata: Metadata = {
  title: "Account — Creos Labs",
  robots: { index: false, follow: false },
};

function Section({
  eyebrow,
  description,
  children,
}: {
  eyebrow: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 28,
        padding: "30px 28px",
        borderTop: "1px solid var(--ws-hairline)",
      }}
    >
      <div>
        <p className="ws-eyebrow">{eyebrow}</p>
        {description && (
          <p className="mt-[10px] text-[11.5px] leading-[1.5]" style={{ color: "var(--ws-ink-45)", maxWidth: "32ch" }}>
            {description}
          </p>
        )}
      </div>
      <div className="ws-card" style={{ padding: 0 }}>
        <div className="ws-stack" style={{ border: "none", borderRadius: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

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
  const email = user?.email ?? "";
  const name = getDisplayName(user);
  const isEmailProvider = !user?.app_metadata?.provider || user.app_metadata.provider === "email";
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
      <WorkspaceHero
        eyebrow={`Account / ${name}`}
        line1="Your account."
        line2="Across every tool."
        sub="One login for Outlier, Signal and whatever comes out of the lab next."
      />

      <Section eyebrow="PROFILE" description="Your name and how we identify you across Outlier and Signal.">
        <EditableNameRow initialValue={name} />
        <WsRow
          label="Avatar"
          value={
            <span
              className="ws-placeholder flex h-[26px] w-[26px] items-center justify-center rounded-full text-[9.5px] font-semibold"
              style={{ color: "var(--ws-ink-60)" }}
            >
              {initials || "?"}
            </span>
          }
        />
        <WsRow label="Time zone" value="Not set" action={<AddTimezoneButton />} />
      </Section>

      <Section eyebrow="SECURITY" description="How you sign in, and where you're signed in from.">
        <WsRow label="Sign-in method" value={providerLabel(user)} />
        <EditableEmailRow initialValue={email} />
        {isEmailProvider && <EditablePasswordRow />}
        <WsRow label="Sessions" value="This device" action={<SignOutOthersButton />} />
      </Section>

      <Section eyebrow="CONNECTED ACCOUNTS" description="Link the platforms Outlier tracks and Signal launches to.">
        <WsRow label="Instagram" value="Not connected" action={<ConnectButton />} />
        <WsRow label="TikTok" value="Not connected" action={<ConnectButton />} />
        <WsRow label="Meta Ads" value="Not connected" action={<ConnectButton />} />
      </Section>

      <Section
        eyebrow="API KEYS"
        description="Only used by your own account. Lets you test Signal and Outlier before the server has its own keys configured."
      >
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
      </Section>

      <Section eyebrow="NOTIFICATIONS" description="Choose what Outlier and Signal are allowed to email you about.">
        <NotificationPreferences initialDisabled={disabledNotifications} />
      </Section>

      <div style={{ padding: "30px 28px", borderTop: "1px solid var(--ws-hairline)" }}>
        <div
          className="flex flex-wrap items-center"
          style={{
            gap: 18,
            padding: "22px 24px",
            borderRadius: 10,
            background: "var(--ws-warn-tint)",
            border: "1px solid var(--ws-warn-tint-border)",
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <p className="ws-eyebrow" style={{ color: "var(--ws-warn-tint-ink)", marginBottom: 10 }}>
              DELETE ACCOUNT
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--ws-warn-tint-ink)" }}>
              This can&rsquo;t be undone. We&rsquo;ll email a copy of your data before it&rsquo;s deleted.
            </p>
          </div>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
