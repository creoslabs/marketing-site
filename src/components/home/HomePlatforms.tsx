import styles from "./home.module.css";

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13.8 9.2h1.7V6.8h-1.9c-1.9 0-2.9 1.1-2.9 3v1.6H9v2.4h1.7V18h2.4v-4.2h1.8l.3-2.4h-2.1v-1.3c0-.6.2-.9.9-.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M16.6 5.82c-.9-.85-1.47-2-1.6-3.32h-3.14v13.44c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1 0-5.44c.26 0 .5.03.74.1V10.2a5.9 5.9 0 0 0-.74-.05 5.86 5.86 0 1 0 5.86 5.86V9.28a8.2 8.2 0 0 0 4.8 1.54V7.68a4.98 4.98 0 0 1-3.2-1.86Z"
        fill="currentColor"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="1" width="22" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 6.5v7l6-3.5-6-3.5Z" fill="currentColor" />
    </svg>
  );
}

const GROUPS = [
  { label: "Meta", icons: [InstagramIcon, FacebookIcon] },
  { label: "TikTok", icons: [TikTokIcon] },
  { label: "YouTube", icons: [YouTubeIcon] },
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
                {group.icons.map((Icon, i) => (
                  <Icon key={i} />
                ))}
              </div>
              <span className={styles.platformLabel}>{group.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
