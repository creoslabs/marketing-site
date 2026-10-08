import { NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/supabase/data";
import { serverProductHref } from "@/lib/product-links";
import { PROVIDERS, type Provider } from "./events";

export type ProductSlug = "outlier" | "signal" | "workspace";

export function parseProvider(value: string): Provider | null {
  return (PROVIDERS as string[]).includes(value) ? (value as Provider) : null;
}

export function parseProduct(value: string | null | undefined): ProductSlug {
  return value === "outlier" || value === "signal" ? value : "workspace";
}

export async function requireUser() {
  const user = await getVerifiedUser();
  return user;
}

export function unauthorized() {
  return NextResponse.json({ error: "Not signed in." }, { status: 401 });
}

// Where to send the user back to after an OAuth round trip: the Integrations
// page of the product they started from (its own subdomain in production).
export function integrationsReturnUrl(request: Request, product: ProductSlug, params: Record<string, string>): URL {
  const target = product === "workspace" ? "root" : product;
  const path = product === "workspace" ? "/workspace/integrations" : "/integrations";
  const href = serverProductHref(request.headers, target, path);
  const url = new URL(href, request.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url;
}
