import { PageHeader } from "@/components/app/ui";

// Legacy landing-hero API, rendered with the shared PageHeader.
export function WsHero({ eyebrow, line1, line2, sub }: { eyebrow: string; line1: string; line2: string; sub: string }) {
  return (
    <div style={{ padding: "40px 32px 0", maxWidth: 1360, margin: "0 auto" }}>
      <PageHeader eyebrow={eyebrow} line1={line1} line2={line2} sub={sub} />
    </div>
  );
}
