"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { LiquidButton } from "@/components/ui/button";

export function LoginForm({
  onSuccess,
  submitLabel = "Sign in",
}: {
  onSuccess: () => void;
  submitLabel?: string;
}) {
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

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
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

      <LiquidButton type="submit" size="lg" disabled={loading} className="mt-2 w-full rounded-full">
        {loading ? "Signing in…" : submitLabel}
      </LiquidButton>
    </form>
  );
}
