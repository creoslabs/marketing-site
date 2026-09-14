import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { WorkspacePageHeader } from "../page-header";
import { EditRowButton, ConnectButton, DeleteAccountButton } from "./account-actions";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? "";
  const localPart = email.split("@")[0] ?? "";
  const name =
    localPart
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p[0].toUpperCase() + p.slice(1))
      .join(" ") || "—";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <WorkspacePageHeader title="Account" subtitle="Profile, sign-in and connected platforms." />

      <div className="grid grid-cols-1 gap-[14px] px-6 pb-[30px] pt-[22px] lg:grid-cols-[1fr_372px]">
        <div className="flex flex-col gap-[14px]">
          <div className="ws-card" style={{ padding: "20px 0" }}>
            <p className="ws-eyebrow" style={{ padding: "0 22px", marginBottom: 15 }}>
              PROFILE
            </p>
            <div className="ws-stack" style={{ border: "none", borderRadius: 0 }}>
              <Row label="Name" value={name} action={<EditRowButton />} />
              <Row
                label="Avatar"
                value=""
                action={
                  <div className="flex items-center gap-[13px]">
                    <span
                      className="ws-placeholder flex h-[26px] w-[26px] items-center justify-center rounded-full text-[9.5px] font-semibold"
                      style={{ color: "var(--ws-ink-60)", border: "1px solid var(--ws-hairline)" }}
                    >
                      {initials || "?"}
                    </span>
                    <EditRowButton label="Change" />
                  </div>
                }
              />
            </div>
          </div>

          <div className="ws-card" style={{ padding: "20px 0" }}>
            <p className="ws-eyebrow" style={{ padding: "0 22px", marginBottom: 15 }}>
              SIGN-IN
            </p>
            <div className="ws-stack" style={{ border: "none", borderRadius: 0 }}>
              <Row label="Email" value={email || "—"} action={<EditRowButton />} />
              <Row label="Password" value="••••••••" action={<EditRowButton label="Change" />} />
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
    </>
  );
}
