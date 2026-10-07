import type { ReactNode } from "react";
import { PageHeader } from "@/components/app/ui";

// Legacy inner-page header API, rendered with the shared PageHeader.
export function WsPageHeader({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return <PageHeader eyebrow={eyebrow ?? ""} line1={title} sub={sub} actions={action} />;
}
