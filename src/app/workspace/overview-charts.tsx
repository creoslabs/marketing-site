// Fixed 104px visualisation area for each product card — kept the same
// height across both so the two cards line up regardless of content.
const VIZ_HEIGHT = 104;

export function OutlierMedianChart({
  scores,
  medianLabel,
  sinceLabel,
}: {
  scores: number[];
  medianLabel: string;
  sinceLabel: string;
}) {
  if (scores.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-[8px] text-[12px]"
        style={{ height: VIZ_HEIGHT, background: "var(--ws-surface-header)", color: "var(--ws-ink-45)" }}
      >
        No posts pulled yet
      </div>
    );
  }

  const max = Math.max(...scores, 1);
  // Every score is already "views ÷ that creator's own median", so the
  // median line sits exactly where a bar would read 1.0 — no separate
  // median series needs to exist for this to be accurate.
  const baselinePct = Math.min(100, (1 / max) * 100);

  return (
    <div style={{ height: VIZ_HEIGHT, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ position: "relative", height: 74, display: "flex", alignItems: "flex-end", gap: 3 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: `${baselinePct}%`,
            height: 1,
            background: "var(--ws-ink-45)",
          }}
        />
        {scores.map((score, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${Math.max(8, (score / max) * 100)}%`,
              borderRadius: "2px 2px 0 0",
              background: score >= 2 ? "var(--ws-accent)" : "var(--ws-hairline-strong)",
            }}
          />
        ))}
      </div>
      <div
        className="flex justify-between"
        style={{ fontSize: 11.5, color: "var(--ws-ink-45)", marginTop: 9 }}
      >
        <span>{medianLabel}</span>
        <span>{sinceLabel}</span>
      </div>
    </div>
  );
}

const VERDICT_LABEL: Record<"pass" | "partial" | "fail", string> = { pass: "Pass", partial: "Partial", fail: "Fail" };
const VERDICT_COLOR: Record<"pass" | "partial" | "fail", string> = {
  pass: "var(--ws-accent-text)",
  partial: "var(--ws-ink-60)",
  fail: "var(--ws-warn-text)",
};

export function SignalCriteriaStrip({
  criteria,
  note,
}: {
  criteria: { name: string; verdict: "pass" | "partial" | "fail" }[];
  note: string | null;
}) {
  if (criteria.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-[8px] text-[12px]"
        style={{ height: VIZ_HEIGHT, background: "var(--ws-surface-header)", color: "var(--ws-ink-45)" }}
      >
        Nothing analysed yet
      </div>
    );
  }

  const passCount = criteria.filter((c) => c.verdict === "pass").length;
  const partialCount = criteria.filter((c) => c.verdict === "partial").length;
  const failCount = criteria.filter((c) => c.verdict === "fail").length;

  return (
    <div style={{ height: VIZ_HEIGHT, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div
        className="flex overflow-hidden rounded-[8px]"
        style={{ gap: 1, background: "var(--ws-hairline)", border: "1px solid var(--ws-hairline)" }}
      >
        {criteria.slice(0, 3).map((c, i) => (
          <div key={i} style={{ flex: 1, background: "var(--ws-surface-header)", padding: "11px 12px", minWidth: 0 }}>
            <div className="truncate" style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ws-ink)" }}>
              {c.name}
            </div>
            <div className="mt-[6px]" style={{ fontSize: 11.5, color: VERDICT_COLOR[c.verdict] }}>
              {VERDICT_LABEL[c.verdict]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex" style={{ gap: 16, fontSize: 11.5, fontWeight: 500, marginTop: 11 }}>
        {passCount > 0 && <span style={{ color: VERDICT_COLOR.pass }}>{passCount} pass</span>}
        {partialCount > 0 && <span style={{ color: VERDICT_COLOR.partial }}>{partialCount} partial</span>}
        {failCount > 0 && <span style={{ color: VERDICT_COLOR.fail }}>{failCount} fail</span>}
        {note && <span style={{ color: "var(--ws-ink-45)", marginLeft: "auto" }}>{note}</span>}
      </div>
    </div>
  );
}
