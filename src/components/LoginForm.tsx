"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { LiquidButton } from "@/components/ui/button";
import homeStyles from "@/components/home/home.module.css";

export function LoginForm({
  onSuccess,
  submitLabel = "Sign in",
  variant = "default",
}: {
  onSuccess: () => void;
  submitLabel?: string;
  // "flat" matches the monochrome editorial design system (home.module.css)
  // used by the homepage and product pages; "default" keeps the original
  // rounded/glassy Tailwind styling the standalone /login page still uses.
  variant?: "default" | "flat";
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

  if (variant === "flat") {
    return (
      <form onSubmit={handleSubmit} className={homeStyles.signInForm}>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error && <p className={homeStyles.signInError}>{error}</p>}
        <button type="submit" disabled={loading} className={homeStyles.btn} style={{ justifyContent: "center" }}>
          {loading ? "Signing in…" : submitLabel}
        </button>
      </form>
    );
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
