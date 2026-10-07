"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./app.module.css";
import { Icon } from "./icons";
import { Avatar, cx } from "./ui";
import { BrandLockup, BrandMark } from "@/components/brand";
import { NotificationBell } from "@/components/notification-bell";
import { useCommandPalette } from "@/components/ws-command-palette";
import { createClient } from "@/lib/supabase/client";
import { useProductHref, useDashboardHref } from "@/lib/use-product-href";

export type AppTab = { href: string; label: string; exact?: boolean; badge?: number };
export type AppProduct = "workspace" | "outlier" | "signal";

const PRODUCT_LABEL: Record<Exclude<AppProduct, "workspace">, string> = { outlier: "Outlier", signal: "Signal" };

function isActive(tab: AppTab, pathname: string) {
  return tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

function useOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOutside();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onOutside, active]);
}

// "/ [Product ▾]" — switches between Workspace, Outlier and Signal. Each
// entry lands on that product's app (the signed-in dashboard), never its
// public landing page.
function ProductSwitcher({ current }: { current: Exclude<AppProduct, "workspace"> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);

  const workspaceHref = useProductHref("root", "/workspace");
  const outlierHref = useDashboardHref("outlier");
  const signalHref = useDashboardHref("signal");
  const entries = [
    { key: "workspace", label: "Workspace", href: workspaceHref },
    { key: "outlier", label: "Outlier", href: outlierHref },
    { key: "signal", label: "Signal", href: signalHref },
  ];

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
      <span className={styles.brandSlash} aria-hidden="true">
        /
      </span>
      <button
        type="button"
        className={styles.switcherBtn}
        aria-label="Switch product"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={cx(styles.disp, styles.switcherName)}>{PRODUCT_LABEL[current]}</span>
        <Icon name="chevronDown" size={14} style={{ color: "var(--ws-ink-45)" }} />
      </button>
      {open && (
        <div className={cx(styles.menu, styles.menuLeft)} style={{ left: 24, top: "calc(100% + 8px)", minWidth: 190 }} role="menu">
          <p className={cx(styles.mono, styles.menuLabel)}>Switch app</p>
          {entries.map((e) => (
            <Link
              key={e.key}
              href={e.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cx(styles.menuItem, e.key !== current && styles.menuItemMuted)}
            >
              {e.label}
              {e.key === current && <span style={{ color: "var(--ws-accent)" }}>•</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountMenu({ name, email, initials }: { name: string; email: string; initials: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  const accountHref = useProductHref("root", "/workspace/account");
  const billingHref = useProductHref("root", "/workspace/billing");

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" className={styles.accountBtn} aria-label="Account menu" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Avatar initials={initials.slice(0, 1)} size={28} paper />
        <span className={styles.accountName}>{name}</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <p className={styles.menuEmail}>{email}</p>
          <div className={styles.menuRule} />
          <Link href={accountHref} role="menuitem" className={styles.menuItem} onClick={() => setOpen(false)}>
            Account
          </Link>
          <Link href={billingHref} role="menuitem" className={styles.menuItem} onClick={() => setOpen(false)}>
            Billing
          </Link>
          <div className={styles.menuRule} />
          <button type="button" role="menuitem" className={styles.menuItem} onClick={signOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// The one header for every signed-in screen: lockup, "/ product" switcher on
// product screens, uppercase nav with a 2px accent underline on the active
// item, ⌘K search, notifications, account. Sticky. Below 900px the nav moves
// behind a menu button.
export function AppHeader({
  product,
  tabs,
  user,
  pulledLabel,
}: {
  product: AppProduct;
  tabs: AppTab[];
  user: { name: string; email: string; initials: string };
  pulledLabel?: string | null;
}) {
  const pathname = usePathname();
  const openPalette = useCommandPalette();
  const homeHref = useProductHref("root", "/workspace");
  // Tied to the pathname it was opened on, so navigating closes it without
  // an effect.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const mobileOpen = openAt === pathname;
  const setMobileOpen = (fn: (v: boolean) => boolean) => setOpenAt(fn(mobileOpen) ? pathname : null);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.brand}>
          <Link href={homeHref} aria-label="Creos Labs workspace" style={{ display: "flex", alignItems: "center" }}>
            <span className={styles.brandFull}>
              <BrandLockup height={22} />
            </span>
            <span className={styles.brandCompact}>
              <BrandMark size={26} />
            </span>
          </Link>
          {product !== "workspace" && <ProductSwitcher current={product} />}
        </div>

        <nav className={styles.nav} aria-label="Main">
          {tabs.map((tab) => {
            const active = isActive(tab, pathname);
            return (
              <Link key={tab.href} href={tab.href} className={cx(styles.navLink, active && styles.navLinkActive)} aria-current={active ? "page" : undefined}>
                {tab.label}
                {tab.badge ? <span className={styles.navBadge}>{tab.badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className={styles.headerRight}>
          {pulledLabel && <span className={styles.pulled}>Pulled {pulledLabel}</span>}
          <button type="button" className={styles.search} onClick={openPalette}>
            <Icon name="searchGlass" />
            <span>Search</span>
            <span className={cx(styles.mono, styles.kbd)}>⌘K</span>
          </button>
          <NotificationBell />
          <AccountMenu {...user} />
          <button
            type="button"
            className={cx(styles.iconBtn, styles.menuToggle)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Icon name={mobileOpen ? "close" : "more"} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className={styles.mobileNav} aria-label="Menu">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href} aria-current={isActive(tab, pathname) ? "page" : undefined}>
              {tab.label}
              {tab.badge ? <span className={styles.navBadge}>{tab.badge}</span> : null}
            </Link>
          ))}
          <button type="button" onClick={openPalette} style={{ all: "unset", padding: "14px 4px", color: "var(--ws-ink-60)", cursor: "pointer" }}>
            Search
          </button>
        </nav>
      )}
    </header>
  );
}
