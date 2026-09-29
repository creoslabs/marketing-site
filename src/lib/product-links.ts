// Outlier and Signal live on their own subdomains in production
// (outlier.<host>, signal.<host>) but still share one Next.js app —
// Workspace/login/dashboard stay on the root domain. A plain relative
// <Link href="/workspace"> only works while everything's under one origin,
// so any link that crosses between root/outlier/signal needs to become an
// absolute cross-origin URL once subdomains are actually active, and stay
// a normal relative path everywhere they aren't (localhost, Vercel
// previews) — mirroring proxy.ts's own rewrite/redirect conditions exactly,
// so a link never points somewhere the middleware wouldn't also route to.
export type ProductTarget = "root" | "outlier" | "signal";

function currentProduct(host: string): "outlier" | "signal" | null {
  const label = host.split(".")[0];
  return label === "outlier" ? "outlier" : label === "signal" ? "signal" : null;
}

function subdomainsActive(host: string): boolean {
  return currentProduct(host) !== null || host === "creos-labs.com" || host === "www.creos-labs.com";
}

export function pathFallback(target: ProductTarget, path: string): string {
  return target === "root" ? path : `/${target}${path === "/" ? "" : path}`;
}

// A product subdomain always hangs off the bare apex (outlier.creos-labs.com)
// — there is no such host as outlier.www.creos-labs.com. rootHost is "www."
// only when the current page IS the root app (Workspace lives there), which
// happens whenever `active` is null; strip it before grafting a product
// label on, or linking from Workspace to Outlier/Signal builds a bad host.
function apexHost(host: string): string {
  return host === "www.creos-labs.com" ? "creos-labs.com" : host;
}

// Mirrors proxy.ts's own toRootHost: the bare apex 308s on to www at the
// DNS/Vercel level, so linking straight to www avoids a redundant redirect.
function canonicalRootHost(host: string): string {
  return host === "creos-labs.com" ? "www.creos-labs.com" : host;
}

// Pure, host-explicit core so both a Server Component (host from
// next/headers) and a Client Component (host from window.location) resolve
// the exact same way. `path` is relative to the TARGET product's own root
// (e.g. "/creators" for Outlier's creators list, not "/outlier/creators").
export function resolveProductHref(host: string, protocol: string, target: ProductTarget, path: string): string {
  if (!subdomainsActive(host)) return pathFallback(target, path);

  const active = currentProduct(host);
  const rootHost = active ? host.slice(`${active}.`.length) : host;
  if (target === "root") {
    return active ? `${protocol}//${canonicalRootHost(rootHost)}${path}` : path;
  }
  if (active === target) return path;
  return `${protocol}//${target}.${apexHost(rootHost)}${path}`;
}

// Server-side convenience wrapper. Vercel always sets x-forwarded-proto to
// https, but a locally-tested subdomain (outlier.localhost:3000) is real
// http — defaulting to https there would produce a link the local dev
// server can't actually serve.
export function serverProductHref(headers: Headers, target: ProductTarget, path: string): string {
  const host = headers.get("host") ?? "";
  const protocol = `${headers.get("x-forwarded-proto") ?? "http"}:`;
  return resolveProductHref(host, protocol, target, path);
}

// Client-side convenience wrapper (browser only).
export function productHref(target: ProductTarget, path: string): string {
  if (typeof window === "undefined") return pathFallback(target, path);
  return resolveProductHref(window.location.host, window.location.protocol, target, path);
}

// The dashboard's external "/app" alias (see proxy.ts) only exists on the
// subdomain — falling back to it verbatim when subdomains aren't active
// (local dev on plain localhost, a Vercel preview) would 404, since there's
// no "/outlier/app" route; the real dashboard there is just "/outlier".
export function resolveDashboardHref(host: string, protocol: string, product: "outlier" | "signal"): string {
  if (!subdomainsActive(host)) return `/${product}`;
  const active = currentProduct(host);
  if (active === product) return "/app";
  const rootHost = active ? host.slice(`${active}.`.length) : host;
  return `${protocol}//${product}.${apexHost(rootHost)}/app`;
}

// Server-side convenience wrapper, mirroring serverProductHref.
export function serverDashboardHref(headers: Headers, product: "outlier" | "signal"): string {
  const host = headers.get("host") ?? "";
  const protocol = `${headers.get("x-forwarded-proto") ?? "http"}:`;
  return resolveDashboardHref(host, protocol, product);
}

// A nav link to "the Outlier/Signal product itself" (as opposed to a
// specific path within it) should always land on marketing content — the
// subdomain root once active, or /products/<product> as the same-domain
// fallback. Plain resolveProductHref("outlier", "/") would fall back to
// "/outlier" instead, which is the authenticated dashboard route, not the
// marketing page — wrong for a header link on a page unauthenticated
// visitors are looking at.
export function resolveLandingHref(host: string, protocol: string, product: "outlier" | "signal"): string {
  if (!subdomainsActive(host)) return `/products/${product}`;
  const active = currentProduct(host);
  if (active === product) return "/";
  const rootHost = active ? host.slice(`${active}.`.length) : host;
  return `${protocol}//${product}.${apexHost(rootHost)}/`;
}

// Backend jobs that write notifications have no request to read a host
// from, so they store product-prefixed paths ("/outlier/creators/123")
// instead. Resolve one of those for wherever it's clicked from — the
// notification bell renders in all three chromes, so an Outlier
// notification opened while sitting in Signal still needs to leave the
// current subdomain.
export function resolveStoredHref(storedHref: string): string {
  const match = storedHref.match(/^\/(outlier|signal)(\/.*)?$/);
  if (!match) return storedHref;
  const [, product, rest] = match;
  return productHref(product as "outlier" | "signal", rest ?? "/");
}

// router.push (App Router) only soft-navigates within the current origin —
// a cross-subdomain href needs a real page load instead.
export function navigateTo(router: { push: (href: string) => void }, href: string) {
  if (href.startsWith("http")) {
    window.location.href = href;
  } else {
    router.push(href);
  }
}
