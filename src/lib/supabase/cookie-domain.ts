// Outlier and Signal now live on their own subdomains (outlier.<root>,
// signal.<root>), sharing one login with the marketing site and Workspace —
// that only works if the session cookie is scoped to the whole root domain
// instead of defaulting to host-only. Localhost and Vercel preview URLs
// can't use a custom-domain cookie at all (the browser silently drops a
// Domain attribute that doesn't match the current host), so this must stay
// undefined there and fall back to today's host-only behavior.
const ROOT_DOMAIN = "creos-labs.com";

export function getCookieDomain(host: string | null | undefined): string | undefined {
  if (!host) return undefined;
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return `.${ROOT_DOMAIN}`;
  }
  return undefined;
}
