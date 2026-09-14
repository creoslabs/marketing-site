export function WorkspacePageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="px-6 pt-[30px]">
      <h1 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
        {title}
      </h1>
      <p className="mt-2 text-[13px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
        {subtitle}
      </p>
    </div>
  );
}
