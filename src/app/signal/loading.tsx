import { AppMain } from "@/components/app/ui";

function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <div className="ws-skeleton" style={{ borderRadius: 12, ...style }} />;
}

export default function LibraryLoading() {
  return (
    <AppMain>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Skeleton style={{ width: 110, height: 14 }} />
        <Skeleton style={{ width: 460, maxWidth: "100%", height: 52 }} />
        <Skeleton style={{ width: 360, maxWidth: "100%", height: 16 }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "3 1 800px", minWidth: 0 }}>
          <Skeleton style={{ height: 480, borderRadius: 22 }} />
        </div>
        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton style={{ height: 220, borderRadius: 22 }} />
          <Skeleton style={{ height: 140, borderRadius: 22 }} />
        </div>
      </div>
    </AppMain>
  );
}
