"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LiquidButton } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError("Supabase isn't configured yet — add your project URL and anon key to .env.local.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

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

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-foreground outline-none placeholder:text-muted focus-visible:border-accent-blue"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-foreground outline-none placeholder:text-muted focus-visible:border-accent-blue"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <LiquidButton
            type="submit"
            size="lg"
            disabled={loading}
            className="mt-2 w-full rounded-full"
          >
            {loading ? "Signing in…" : "Sign in"}
          </LiquidButton>
        </form>
      </div>
    </main>
  );
}
