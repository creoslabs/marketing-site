import { Emoji } from "@/components/app/ui";

// Empty state: a quiet centred block — title, one line of explanation, and
// the next step as a button.
export function EmptyState({
  title,
  description,
  action,
  size = "compact",
  emoji,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: "compact" | "large";
  emoji?: string;
}) {
  const large = size === "large";
  return (
    <div className="flex flex-col items-center text-center" style={{ padding: large ? "64px 24px" : "28px 20px", gap: 10 }}>
      {emoji && <Emoji size={large ? 40 : 28}>{emoji}</Emoji>}
      <p style={{ margin: 0, color: "var(--ws-ink)", fontSize: large ? 22 : 15, fontWeight: 700, letterSpacing: large ? "-0.02em" : 0 }}>{title}</p>
      {description && (
        <p style={{ margin: 0, color: "var(--ws-ink-60)", fontSize: large ? 15 : 13, lineHeight: 1.5, maxWidth: large ? 420 : 300 }}>{description}</p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
