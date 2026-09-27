"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute -top-64 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />

      <div className="relative w-full max-w-sm">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Creos Labs
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-muted">Internal access only.</p>

        <div className="mt-8">
          <LoginForm
            onSuccess={() => {
              router.push("/workspace");
              router.refresh();
            }}
          />
        </div>
      </div>
    </main>
  );
}
