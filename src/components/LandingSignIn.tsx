"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import styles from "@/components/home/home.module.css";
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
      <div className={styles.signInBox}>
        <h3>Welcome back.</h3>
        <p>You&rsquo;re signed in to {productName}.</p>
        <Link href={dashboardHref} className={styles.btn} style={{ marginTop: 20, justifyContent: "center" }}>
          Go to Dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.signInBox}>
      <h3>Already using {productName}?</h3>
      <p>Sign in below.</p>
      <LoginForm variant="flat" onSuccess={() => router.refresh()} />
    </div>
  );
}
