import type { ComponentProps, CSSProperties, ReactNode } from "react";
import Link from "next/link";
import styles from "./app.module.css";
import { Icon, type IconName } from "./icons";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const appStyles = styles;

// ---------------------------------------------------------------- Button --

export type ButtonVariant = "primary" | "paper" | "ghost" | "ink" | "danger" | "link" | "linkDanger";

const BUTTON_CLASS: Record<ButtonVariant, string> = {
  primary: styles.btnPrimary,
  paper: styles.btnPaper,
  ghost: styles.btnGhost,
  ink: styles.btnInk,
  danger: styles.btnDanger,
  link: cx(styles.btnLink),
  linkDanger: cx(styles.btnLink, styles.btnLinkDanger),
};

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  icon?: IconName;
  href?: string;
  external?: boolean;
  children: ReactNode;
};

// Pill button, 40px (36px small). Renders a Link when given an href.
export function Button({
  variant = "ghost",
  size = "md",
  icon,
  href,
  external,
  className,
  style,
  children,
  ...rest
}: ButtonOwnProps & Omit<ComponentProps<"button">, "children">) {
  const cls = cx(styles.btn, size === "sm" && styles.btnSm, BUTTON_CLASS[variant], className);
  const content = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </>
  );
  if (href) {
    if (external || href.startsWith("http") || href.startsWith("mailto:")) {
      return (
        <a href={href} className={cls} style={style}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} style={style}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} style={style} {...rest}>
      {content}
    </button>
  );
}

// ------------------------------------------------------------------ Chip --

export type ChipVariant = "outline" | "soft" | "paper" | "white" | "accent" | "ink" | "fail";

const CHIP_CLASS: Record<ChipVariant, string> = {
  outline: styles.chipOutline,
  soft: styles.chipSoft,
  paper: styles.chipPaper,
  white: styles.chipWhite,
  accent: styles.chipAccent,
  ink: styles.chipInk,
  fail: styles.chipFail,
};

export function Chip({
  variant = "soft",
  children,
  className,
  style,
  title,
}: {
  variant?: ChipVariant;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <span className={cx(styles.mono, styles.chip, CHIP_CLASS[variant], className)} style={style} title={title}>
      {children}
    </span>
  );
}

// ------------------------------------------------------------ Typography --

export function Emoji({ children, size, className }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <span className={cx(styles.emo, className)} style={size ? { fontSize: size } : undefined} aria-hidden="true">
      {children}
    </span>
  );
}

export function Mono({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={cx(styles.mono, className)} style={style}>
      {children}
    </span>
  );
}

// ------------------------------------------------------------------ Card --

export function Card({
  children,
  paper,
  ring,
  className,
  style,
  as: Tag = "div",
}: {
  children: ReactNode;
  paper?: boolean;
  ring?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag className={cx(styles.card, paper && styles.cardPaper, ring && styles.cardRing, className)} style={style}>
      {children}
    </Tag>
  );
}

export function CardHead({
  label,
  paper,
  right,
}: {
  label: ReactNode;
  paper?: boolean;
  right?: ReactNode;
}) {
  return (
    <div className={styles.cardHead}>
      <span className={cx(styles.mono, styles.cardLabel, paper && styles.cardLabelPaper)}>{label}</span>
      {right}
    </div>
  );
}

// ---------------------------------------------------------------- Avatar --

export function Avatar({
  initials,
  src,
  size = 24,
  paper,
}: {
  initials: string;
  src?: string | null;
  size?: number;
  paper?: boolean;
}) {
  return (
    <span className={cx(styles.avatar, paper && styles.avatarPaper)} style={{ "--s": `${size}px` } as CSSProperties} aria-hidden="true">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- scraped CDN avatar URL, not optimisable by next/image
        <img src={src} alt="" className={styles.avatarImg} referrerPolicy="no-referrer" />
      ) : (
        initials
      )}
    </span>
  );
}

// ------------------------------------------------------------ PageHeader --

// Accent eyebrow, two-line uppercase headline (second line grey), one-line
// summary, actions aligned right.
export function PageHeader({
  eyebrow,
  line1,
  line2,
  sub,
  actions,
}: {
  eyebrow: ReactNode;
  line1: ReactNode;
  line2?: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.pageHead}>
      <div className={styles.pageHeadText}>
        <span className={cx(styles.mono, styles.eyebrow)}>{eyebrow}</span>
        <h1 className={cx(styles.disp, styles.h1)}>
          {line1}
          {line2 && (
            <>
              <br />
              <span className={styles.h1Grey}>{line2}</span>
            </>
          )}
        </h1>
        {sub && <p className={styles.pageSub}>{sub}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </div>
  );
}

export function AppMain({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx(styles.main, className)}>{children}</main>;
}

// ----------------------------------------------------------------- Alert --

// Error surface: states the problem, what is safe, and the fix as buttons.
export function Alert({
  title,
  children,
  actions,
  compact,
  icon = "⚠️",
}: {
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
  icon?: string;
}) {
  return (
    <div className={cx(styles.alert, compact && styles.alertCompact)} role="alert">
      <span className={cx(styles.emo, styles.alertIcon)} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.alertBody}>
        {title && <b>{title}</b>}
        <span>{children}</span>
      </div>
      {actions && <div className={styles.alertActions}>{actions}</div>}
    </div>
  );
}

// ------------------------------------------------------------- StatsRow --

export type Stat = { label: string; value: ReactNode; note?: ReactNode; accent?: boolean };

// One bordered strip split into cells; the key metric in accent.
export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          <span className={cx(styles.mono, styles.statLabel)}>{s.label}</span>
          <span className={cx(styles.disp, styles.statValue, s.accent && styles.statValueAccent)}>{s.value}</span>
          {s.note && <span className={styles.statNote}>{s.note}</span>}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Status --

export type StatusKind = "pass" | "partial" | "fail";

const STATUS_META: Record<StatusKind, { emoji: string; label: string }> = {
  pass: { emoji: "✅", label: "Pass" },
  partial: { emoji: "⚠️", label: "Partial" },
  fail: { emoji: "❌", label: "Fail" },
};

export function statusEmoji(kind: StatusKind) {
  return STATUS_META[kind].emoji;
}

// Emoji plus a text label — never colour alone.
export function Status({ kind, label }: { kind: StatusKind; label?: string }) {
  return (
    <span className={cx(styles.mono, styles.status, kind === "fail" && styles.statusFail, kind === "partial" && styles.statusPartial)}>
      {label ?? STATUS_META[kind].label}
    </span>
  );
}

export function StatusCountChip({ kind, count }: { kind: StatusKind; count: number }) {
  return (
    <Chip variant={kind === "fail" ? "fail" : "soft"}>
      <span className={styles.emo} aria-hidden="true">
        {STATUS_META[kind].emoji}
      </span>
      {count} {STATUS_META[kind].label.toLowerCase()}
    </Chip>
  );
}
