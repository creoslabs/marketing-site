import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Dashboard — Creos Labs",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute -top-64 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />

      <div className="relative flex flex-col items-center gap-6">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Creos Labs
        </Link>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            Dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back.
          </h1>
          <p className="mt-2 text-muted">Signed in as {user.email}</p>
        </div>

        <SignOutButton />
      </div>
    </main>
  );
}
