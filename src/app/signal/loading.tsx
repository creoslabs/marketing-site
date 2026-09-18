function SkeletonBlock({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return <div className={`ws-skeleton rounded-[6px]${className ? ` ${className}` : ""}`} style={style} />;
}

export default function LibraryLoading() {
  return (
    <div className="grid grid-cols-1 gap-[26px] lg:grid-cols-[1fr_340px]" style={{ padding: "26px 22px" }}>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-[16px]">
          <div>
            <SkeletonBlock style={{ width: 120, height: 24 }} />
            <SkeletonBlock style={{ width: 220, height: 14, marginTop: 10 }} />
          </div>
          <div className="flex items-center gap-[9px]">
            <SkeletonBlock style={{ width: 76, height: 34, borderRadius: 7 }} />
            <SkeletonBlock style={{ width: 76, height: 34, borderRadius: 7 }} />
            <SkeletonBlock style={{ width: 88, height: 34, borderRadius: 7 }} />
          </div>
        </div>

        <div className="mt-[24px]">
          <SkeletonBlock style={{ width: 90, height: 12 }} />
          <div className="mt-[12px] grid items-start gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fill, 110px)" }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i}>
                <SkeletonBlock style={{ aspectRatio: "9/16", borderRadius: 10 }} />
                <SkeletonBlock style={{ width: "80%", height: 12, marginTop: 10 }} />
                <SkeletonBlock style={{ width: "55%", height: 10, marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[14px]">
        <SkeletonBlock style={{ height: 190, borderRadius: 12 }} />
      </div>
    </div>
  );
}
