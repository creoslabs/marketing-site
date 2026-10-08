import type { Metadata } from "next";
import { IntegrationsPage } from "@/components/integrations/integrations-page";

export const metadata: Metadata = {
  title: "Integrations — Creos Labs",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <IntegrationsPage product="signal" searchParams={await searchParams} />;
}
