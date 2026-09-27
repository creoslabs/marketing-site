import { createServerClient } from "@supabase/ssr";
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
// route under the subdomain.
function toRootHost(host: string, product: "outlier" | "signal" | null): string {
  return product ? host.slice(`${product}.`.length) : host;
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

  // Serve /outlier/* or /signal/* internally for a clean subdomain URL
  // (outlier.<host>/feed rather than outlier.<host>/outlier/feed). A path
  // that already carries the prefix — an old absolute link, an asset route
  // like /outlier/icon.svg — is left alone rather than doubled up.
  const rewrittenPath =
    subdomainProduct && !originalPath.startsWith(`/${subdomainProduct}`)
      ? originalPath === "/"
        ? `/${subdomainProduct}`
        : `/${subdomainProduct}${originalPath}`
      : originalPath;

  function next(init?: { request: NextRequest }) {
    if (rewrittenPath === originalPath) {
      return init ? NextResponse.next(init) : NextResponse.next();
    }
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewrittenPath;
    return init ? NextResponse.rewrite(rewriteUrl, init) : NextResponse.rewrite(rewriteUrl);
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

  let supabaseResponse = next({ request });

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
          supabaseResponse = next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

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

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|api/waitlist).*)",
  ],
};
