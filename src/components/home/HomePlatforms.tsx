import styles from "./home.module.css";

// Same accurate brand-colored badge treatment as Outlier's own PlatformBadge
// (src/app/outlier/components.tsx) — real logos, not line-art abstractions,
// so this reads as actual platform support rather than a generic icon set.
const BADGES: { key: string; label: string; bg: string; icon: React.ReactNode }[] = [
  {
    key: "instagram",
    label: "Instagram",
    bg: "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="#fff" strokeWidth="2" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    bg: "#0866FF",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M14.2 21V13.5h2.5l.4-3H14.2V8.5c0-.87.24-1.46 1.5-1.46h1.6V4.35C17 4.24 16.05 4 14.95 4 12.65 4 11.1 5.4 11.1 8.2v2.3H8.6v3h2.5V21h3.1Z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    bg: "#000000",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M16.6 5.82c-.9-.85-1.47-2-1.6-3.32h-3.14v13.44c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1 0-5.44c.26 0 .5.03.74.1V10.2a5.9 5.9 0 0 0-.74-.05 5.86 5.86 0 1 0 5.86 5.86V9.28a8.2 8.2 0 0 0 4.8 1.54V7.68a4.98 4.98 0 0 1-3.2-1.86Z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    bg: "#FF0000",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9.5 8.5v7l6-3.5-6-3.5Z" fill="#fff" />
      </svg>
    ),
  },
];

const GROUPS = [
  { label: "Meta", badgeKeys: ["instagram", "facebook"] },
  { label: "TikTok", badgeKeys: ["tiktok"] },
  { label: "YouTube", badgeKeys: ["youtube"] },
];

export function HomePlatforms() {
  return (
    <section className={styles.platforms}>
      <div className={styles.wrap}>
        <span className={styles.label}>Already where you work</span>
        <h2 className={styles.platformsHeadline}>We already support the platforms you use.</h2>
        <div className={styles.platformsRow}>
          {GROUPS.map((group) => (
            <div key={group.label} className={styles.platformGroup}>
              <div className={styles.platformIcons}>
                {group.badgeKeys.map((key) => {
                  const badge = BADGES.find((b) => b.key === key)!;
                  return (
                    <span key={key} className={styles.platformBadge} style={{ background: badge.bg }} aria-label={badge.label}>
                      {badge.icon}
                    </span>
                  );
                })}
              </div>
              <span className={styles.platformLabel}>{group.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
