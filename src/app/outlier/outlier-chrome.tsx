"use client";

import { AppHeader, type AppTab } from "@/components/app/AppHeader";

export function OutlierChrome({
  runningCount,
  lastPulledLabel,
  name,
  email,
  initials,
}: {
  runningCount: number;
  lastPulledLabel: string | null;
  name: string;
  email: string;
  initials: string;
}) {
  const tabs: AppTab[] = [
    { href: "/outlier", label: "Home", exact: true },
    { href: "/outlier/feed", label: "Feed" },
    { href: "/outlier/trends", label: "Trends" },
    { href: "/outlier/creators", label: "Creators" },
    { href: "/outlier/progress", label: "Progress", badge: runningCount > 0 ? runningCount : undefined },
  ];
  return <AppHeader product="outlier" tabs={tabs} user={{ name, email, initials }} pulledLabel={lastPulledLabel} />;
}
