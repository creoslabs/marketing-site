import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getCookieDomain } from "./lib/supabase/cookie-domain";

const PROTECTED_ROUTES = ["/workspace", "/outlier", "/signal", "/dashboard"];
const ROOT_HOSTS = ["creos-labs.com", "www.creos-labs.com"];

// Outlier and Signal each live on their own subdomain (outlier.<host>,
// signal.<host>) on top of the exact same route trees (/outlier, /signal)
// that already existed — this only looks at the leftmost hostname label, so
// it works identically on the production custom domain and on localhost
// (outlier.localhost:3000 resolves to loopback with no hosts-file edits
// needed) with no environment-specific branching. A Vercel preview URL or
// any other host just doesn't match either label and falls through
// unchanged, keeping preview deploys on today's path-based routing.
function detectProductSubdomain(host: string): "outlier" | "signal" | null {
  const label = host.split(".")[0];
  if (label === "outlier") return "outlier";
  if (label === "signal") return "signal";
  return null;
}

// /login (and everything else outside /outlier and /signal) only exists on
// the root app tree — this strips a detected product label back off so a
// redirect built from it lands on the root domain instead of a nonexistent
// route under the subdomain. The bare apex 308s on to www at the DNS/Vercel
// level, so landing there first would mean two redirects — go straight to
// www instead.
function toRootHost(host: string, product: "outlier" | "signal" | null): string {
  const stripped = product ? host.slice(`${product}.`.length) : host;
  return stripped === "creos-labs.com" ? "www.creos-labs.com" : stripped;
}

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && /^https?:\/\//.test(url));
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const originalPath = request.nextUrl.pathname;
  const subdomainProduct = detectProductSubdomain(host);

  if (subdomainProduct && originalPath === "/login") {
    return NextResponse.redirect(new URL("/login", `${request.nextUrl.protocol}//${toRootHost(host, subdomainProduct)}`));
  }

  // An old /outlier or /signal link hit on the bare root domain redirects to
  // its canonical subdomain rather than serving app content there. Skipped
  // everywhere else (localhost, previews) — there's no real subdomain to
  // send anyone to in those environments.
  if (!subdomainProduct && ROOT_HOSTS.includes(host)) {
    const match = originalPath.match(/^\/(outlier|signal)(\/.*)?$/);
    if (match) {
      const [, product, rest] = match;
      const target = new URL(rest ?? "/", `https://${product}.creos-labs.com`);
      target.search = request.nextUrl.search;
      return NextResponse.redirect(target);
    }
  }

  // The subdomain's bare root is always the product's own public landing
  // page (the existing /products/<product> marketing page) — signed in or
  // out. Signed out it shows an embedded sign-in; signed in, the page
  // itself swaps that for a "Go to Dashboard" link to /app instead, which
  // is the actual signed-in app. /app is a clean external alias for the
  // /outlier or /signal route tree's own root (kept out of "/" so a visit
  // to the bare domain never depends on auth state to decide what renders).
  // Everything else still serves /outlier/* or /signal/* internally for a
  // clean subdomain URL (outlier.<host>/feed rather than
  // outlier.<host>/outlier/feed) — a path that already carries the prefix
  // (an old absolute link, an asset route like /outlier/icon.svg) is left
  // alone rather than doubled up.
  const rewrittenPath = !subdomainProduct
    ? originalPath
    : originalPath === "/"
      ? `/products/${subdomainProduct}`
      : originalPath === "/app"
        ? `/${subdomainProduct}`
        : originalPath.startsWith(`/${subdomainProduct}`) || originalPath.startsWith("/api/")
          ? originalPath
          : `/${subdomainProduct}${originalPath}`;

  function buildResponse(path: string, init?: { request: NextRequest }) {
    if (path === originalPath) {
      return init ? NextResponse.next(init) : NextResponse.next();
    }
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = path;
    return init ? NextResponse.rewrite(rewriteUrl, init) : NextResponse.rewrite(rewriteUrl);
  }

  function next(init?: { request: NextRequest }) {
    return buildResponse(rewrittenPath, init);
  }

  const isProtected = PROTECTED_ROUTES.some((route) => rewrittenPath.startsWith(route));

  // Only /login and the protected app routes ever need an auth decision.
  // Every other request (the entire public marketing site) skips Supabase
  // entirely — calling getUser() here was previously unconditional, which
  // meant every marketing-page request paid for a full network round-trip
  // to Supabase's auth server for no reason.
  if (!isProtected && originalPath !== "/login") {
    return next();
  }

  // Supabase isn't configured yet (still using .env.local placeholders) —
  // keep the public marketing site working, but still block /dashboard
  // since no one can possibly be authenticated without real credentials.
  if (!isSupabaseConfigured()) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", `${request.nextUrl.protocol}//${toRootHost(host, subdomainProduct)}`));
    }
    return next();
  }

  // Cookie writes from the Supabase client are collected here rather than
  // baked into a response immediately, since the outcome (redirect to
  // /login vs. serve rewrittenPath) isn't known until getUser() resolves
  // below — the response is only built once, at the end.
  let pendingCookies: { name: string; value: string; options?: CookieOptionsWithName }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { domain: getCookieDomain(host) },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          pendingCookies = cookiesToSet;
        },
      },
    }
  );

  function respond(path: string) {
    const response = buildResponse(path, { request });
    pendingCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    );
    return response;
  }

  // Refreshes the session token on every protected/login request — required
  // by Supabase's SSR auth pattern, otherwise sessions expire prematurely.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", `${request.nextUrl.protocol}//${toRootHost(host, subdomainProduct)}`));
  }

  if (originalPath === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/workspace";
    return NextResponse.redirect(url);
  }

  return respond(rewrittenPath);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|brand/|opengraph-image|twitter-image|api/waitlist).*)",
  ],
};
