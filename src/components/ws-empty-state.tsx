export function EmptyState({
  title,
  description,
  action,
  size = "compact",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: "compact" | "large";
}) {
  const large = size === "large";
  return (
    <div className="flex flex-col items-center text-center" style={{ padding: large ? "56px 24px" : "28px 20px" }}>
      <p
        className={large ? "font-semibold" : "font-medium"}
        style={{ color: "var(--ws-ink)", fontSize: large ? 17 : 13 }}
      >
        {title}
      </p>
      {description && (
        <p
          className="mt-[8px]"
          style={{ color: "var(--ws-ink-45)", fontSize: large ? 13.5 : 12, lineHeight: 1.5, maxWidth: large ? 360 : 280 }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-[16px]">{action}</div>}
    </div>
  );
}
