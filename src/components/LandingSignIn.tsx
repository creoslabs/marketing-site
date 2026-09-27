"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { LiquidButton } from "@/components/ui/button";
import { useDashboardHref } from "@/lib/use-product-href";

// Used on a product's own subdomain root (outlier./signal.<host>/), which
// always shows this same landing page whether or not you're signed in.
// Signed out, this is a sign-in form — signing in doesn't need to navigate
// anywhere, since refreshing re-runs proxy.ts against the now-authenticated
// session and the page updates in place. Signed in, it's a "Go to Dashboard"
// link to /app instead, the actual signed-in app (kept off "/" itself so
// this landing page never depends on auth state to decide what's at "/").
export function LandingSignIn({
  productName,
  product,
  isLoggedIn,
}: {
  productName: string;
  product: "outlier" | "signal";
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const dashboardHref = useDashboardHref(product);

  if (isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <h3 className="text-[15px] font-semibold">Welcome back.</h3>
        <p className="mt-1 text-sm text-muted">You&rsquo;re signed in to {productName}.</p>
        <LiquidButton asChild size="lg" className="mt-5 w-full rounded-full">
          <Link href={dashboardHref}>Go to Dashboard →</Link>
        </LiquidButton>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-[15px] font-semibold">Already using {productName}?</h3>
      <p className="mt-1 text-sm text-muted">Sign in below.</p>
      <div className="mt-5">
        <LoginForm onSuccess={() => router.refresh()} />
      </div>
    </div>
  );
}
