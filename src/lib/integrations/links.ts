import { siteUrl } from "./config";

// Absolute links back into the app, for messages that leave it. Product
// pages live on their own subdomain in production and under /<product> on
// localhost and previews, mirroring proxy.ts.
export function appLink(product: "outlier" | "signal", path: string): string {
  const base = siteUrl();
  if (new URL(base).hostname.endsWith("creos-labs.com")) return `https://${product}.creos-labs.com${path}`;
  return `${base}/${product}${path}`;
}

export function integrationsLink(product: "outlier" | "signal" | "workspace" = "workspace"): string {
  if (product === "workspace") return `${siteUrl()}/workspace/integrations`;
  return appLink(product, "/integrations");
}
