function SkeletonBlock({ style }: { style?: React.CSSProperties }) {
  return <div className="ws-skeleton rounded-[6px]" style={style} />;
}

export default function ReportLoading() {
  return (
    <div>
      <div
        className="flex items-center gap-[14px] px-6"
        style={{ minHeight: 56, padding: "12px 22px", borderBottom: "1px solid var(--ws-hairline)" }}
      >
        <SkeletonBlock style={{ width: 60, height: 12 }} />
        <div className="h-[18px] w-px" style={{ background: "var(--ws-hairline)" }} />
        <SkeletonBlock style={{ width: 160, height: 14 }} />
        <SkeletonBlock style={{ width: 90, height: 20, borderRadius: 4 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
        <div
          className="flex flex-col gap-[22px] lg:flex-row"
          style={{ padding: "22px", borderRight: "1px solid var(--ws-hairline)" }}
        >
          <div style={{ width: 250, flexShrink: 0 }}>
            <SkeletonBlock style={{ width: 250, height: 444, borderRadius: 10 }} />
            <SkeletonBlock style={{ width: 250, height: 38, marginTop: 10, borderRadius: 7 }} />
          </div>
          <div className="flex-1">
            <SkeletonBlock style={{ width: 200, height: 12 }} />
            <SkeletonBlock style={{ width: 140, height: 52, marginTop: 12 }} />
            <SkeletonBlock style={{ width: "100%", height: 8, marginTop: 20, borderRadius: 4 }} />
            <SkeletonBlock style={{ width: "100%", height: 60, marginTop: 24, borderRadius: 6 }} />
            <SkeletonBlock style={{ width: "100%", height: 220, marginTop: 20, borderRadius: 8 }} />
          </div>
        </div>

        <div style={{ padding: "22px" }}>
          <SkeletonBlock style={{ width: 150, height: 12 }} />
          <div className="mt-[14px] flex flex-col gap-[10px]">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonBlock key={i} style={{ height: 62, borderRadius: 8 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
