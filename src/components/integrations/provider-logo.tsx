import type { Provider } from "@/lib/integrations/events";
import { PROVIDER_META } from "@/lib/integrations/events";
import styles from "./integrations.module.css";

// Official brand artwork only — dropped into public/brand/integrations/
// (slack.svg, sheets.svg, notion.svg) from each brand's published asset
// pack. Until a file is there, the tile shows the service's initial rather
// than anything redrawn. Email uses a generic envelope, not a brand mark.
export function ProviderLogo({ provider, hasFile, size = 44 }: { provider: Provider; hasFile: boolean; size?: number }) {
  const inner = Math.round(size * 0.6);
  return (
    <span className={styles.logo} style={{ width: size, height: size }} aria-hidden="true">
      {provider === "email" ? (
        <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M4 7l8 6 8-6" />
        </svg>
      ) : hasFile ? (
        // eslint-disable-next-line @next/next/no-img-element -- static brand SVG
        <img src={`/brand/integrations/${provider}.svg`} alt="" className={styles.logoImg} style={{ width: inner, height: inner }} />
      ) : (
        <span style={{ fontSize: inner * 0.8, fontWeight: 700 }}>{PROVIDER_META[provider].name.charAt(0)}</span>
      )}
    </span>
  );
}
