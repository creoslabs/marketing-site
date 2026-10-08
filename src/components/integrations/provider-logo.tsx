import type { Provider } from "@/lib/integrations/events";
import { PROVIDER_META } from "@/lib/integrations/events";
import styles from "./integrations.module.css";

// Official brand artwork only — dropped into public/brand/integrations/
// (slack.svg, email.svg, sheets.svg, notion.svg) from each brand's published asset
// pack. Until a file is there, the tile shows the service's initial rather
// than anything redrawn.
export function ProviderLogo({ provider, hasFile, size = 44 }: { provider: Provider; hasFile: boolean; size?: number }) {
  const inner = Math.round(size * 0.6);
  return (
    <span className={styles.logo} style={{ width: size, height: size }} aria-hidden="true">
      {hasFile ? (
        // eslint-disable-next-line @next/next/no-img-element -- static brand SVG
        <img src={`/brand/integrations/${provider}.svg`} alt="" className={styles.logoImg} style={{ width: inner, height: inner }} />
      ) : (
        <span style={{ fontSize: inner * 0.8, fontWeight: 700 }}>{PROVIDER_META[provider].name.charAt(0)}</span>
      )}
    </span>
  );
}
