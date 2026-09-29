// Shared 46px two-line "landing" hero — used by Workspace's Overview/
// Billing/Account, and by Outlier Home / Signal Library (the "landing
// screens" per the design handoff, which get this treatment instead of the
// smaller WsPageHeader every other inner page uses). Uppercase to match the
// nav/wordmark treatment elsewhere in the chrome — same principle the
// marketing homepage already uses on its own big display headlines
// (uppercase + tight negative tracking), just at app scale.
export function WsHero({
  eyebrow,
  line1,
  line2,
  sub,
}: {
  eyebrow: string;
  line1: string;
  line2: string;
  sub: string;
}) {
  return (
    <div style={{ padding: "52px 28px 0" }}>
      <p className="ws-eyebrow" style={{ marginBottom: 22 }}>
        {eyebrow}
      </p>
      <h1
        style={{
          margin: 0,
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.02,
          textTransform: "uppercase",
          color: "var(--ws-ink)",
        }}
      >
        {line1}
        <br />
        <span style={{ color: "var(--ws-headline-grey)" }}>{line2}</span>
      </h1>
      <p
        style={{
          margin: 0,
          marginTop: 18,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--ws-ink-60)",
          maxWidth: "56ch",
        }}
      >
        {sub}
      </p>
    </div>
  );
}
