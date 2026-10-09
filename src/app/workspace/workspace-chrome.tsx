"use client";

import { AppHeader, type AppTab } from "@/components/app/AppHeader";

const TABS: AppTab[] = [
  { href: "/workspace", label: "Overview", exact: true },
  { href: "/workspace/account", label: "Account" },
  { href: "/workspace/billing", label: "Billing" },
];

export function WorkspaceChrome({ name, email, initials }: { name: string; email: string; initials: string }) {
  return <AppHeader product="workspace" tabs={TABS} user={{ name, email, initials }} />;
}
