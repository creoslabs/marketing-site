import { NextResponse } from "next/server";
import { providerConfigured, redirectUri } from "@/lib/integrations/config";
import { signToken } from "@/lib/integrations/crypto";
import { integrationsReturnUrl, parseProduct, parseProvider, requireUser } from "@/lib/integrations/http";

// Starts an OAuth flow. Always hands off to the provider's own approve
// screen; the redirect URI is the root-domain callback registered with each
// provider, whichever product the user started from.
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const provider = parseProvider((await params).provider);
  const url = new URL(request.url);
  const product = parseProduct(url.searchParams.get("product"));
  if (!provider || provider === "email") return NextResponse.json({ error: "Unknown integration." }, { status: 404 });

  const user = await requireUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  if (!providerConfigured(provider)) {
    return NextResponse.redirect(integrationsReturnUrl(request, product, { error: "That integration isn't available yet.", provider }));
  }

  const name = (url.searchParams.get("name") ?? "").trim().slice(0, 80);
  const state = signToken({ u: user.id, p: provider, r: product, n: name }, 15 * 60);

  if (provider === "slack") {
    const auth = new URL("https://slack.com/oauth/v2/authorize");
    auth.searchParams.set("client_id", process.env.SLACK_CLIENT_ID!);
    auth.searchParams.set("scope", "incoming-webhook,chat:write");
    auth.searchParams.set("redirect_uri", redirectUri("slack"));
    auth.searchParams.set("state", state);
    return NextResponse.redirect(auth);
  }

  if (provider === "sheets") {
    const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    auth.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
    auth.searchParams.set("redirect_uri", redirectUri("sheets"));
    auth.searchParams.set("response_type", "code");
    // drive.file only: access to files this app creates, nothing else.
    auth.searchParams.set("scope", "https://www.googleapis.com/auth/drive.file");
    auth.searchParams.set("access_type", "offline");
    auth.searchParams.set("prompt", "consent");
    auth.searchParams.set("state", state);
    return NextResponse.redirect(auth);
  }

  const auth = new URL("https://api.notion.com/v1/oauth/authorize");
  auth.searchParams.set("client_id", process.env.NOTION_CLIENT_ID!);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("owner", "user");
  auth.searchParams.set("redirect_uri", redirectUri("notion"));
  auth.searchParams.set("state", state);
  return NextResponse.redirect(auth);
}
