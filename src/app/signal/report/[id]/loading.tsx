import { AppMain } from "@/components/app/ui";

function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <div className="ws-skeleton" style={{ borderRadius: 12, ...style }} />;
}

export default function ReportLoading() {
  return (
    <AppMain>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Skeleton style={{ width: 70, height: 14 }} />
        <Skeleton style={{ width: 220, height: 28 }} />
        <Skeleton style={{ width: 130, height: 24, borderRadius: 999 }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 300px", width: 300 }}>
          <Skeleton style={{ height: 520, borderRadius: 16 }} />
        </div>
        <div style={{ flex: "2 1 520px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton style={{ height: 180, borderRadius: 22 }} />
          <Skeleton style={{ height: 34 }} />
          <Skeleton style={{ height: 320, borderRadius: 20 }} />
        </div>
        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton style={{ height: 200, borderRadius: 22 }} />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} style={{ height: 64, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    </AppMain>
  );
}
