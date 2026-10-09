import { AppMain } from "@/components/app/ui";

function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <div className="ws-skeleton" style={{ borderRadius: 12, ...style }} />;
}

// Shown instantly while a page's data loads, so navigating feels immediate
// instead of freezing on the previous screen.
export default function Loading() {
  return (
    <AppMain>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Skeleton style={{ width: 120, height: 14 }} />
        <Skeleton style={{ width: 460, maxWidth: "100%", height: 52 }} />
        <Skeleton style={{ width: 340, maxWidth: "100%", height: 16 }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <Skeleton style={{ flex: "1 1 280px", height: 260, borderRadius: 22 }} />
        <Skeleton style={{ flex: "1 1 280px", height: 260, borderRadius: 22 }} />
        <Skeleton style={{ flex: "1 1 280px", height: 260, borderRadius: 22 }} />
      </div>
    </AppMain>
  );
}
