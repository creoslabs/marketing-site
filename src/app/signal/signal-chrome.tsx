"use client";

import { AppHeader, type AppTab } from "@/components/app/AppHeader";

const TABS: AppTab[] = [
  { href: "/signal/analyze", label: "Analyze" },
  { href: "/signal", label: "Library", exact: true },
  { href: "/signal/benchmarks", label: "Benchmarks" },
  { href: "/signal/compare", label: "Compare" },
];

export function SignalChrome({ name, email, initials, attention }: { name: string; email: string; initials: string; attention?: boolean }) {
  return <AppHeader product="signal" tabs={TABS} user={{ name, email, initials }} attention={attention} />;
}
