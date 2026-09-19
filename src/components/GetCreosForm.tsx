"use client";

import { useState, type FormEvent } from "react";
import { LiquidButton } from "@/components/ui/button";

type Status = "idle" | "loading" | "success" | "error";

// The one real signup mechanism on the site — deliberately lives only here,
// inside the pricing card, so there's a single moment where a visitor enters
// their email rather than two near-identical "Get Creos" forms in different
// places on the page.
export function GetCreosForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="w-full rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-center text-sm font-medium text-foreground">
        You&apos;re on the list — we&apos;ll be in touch.
      </p>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          disabled={status === "loading"}
          className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-[15px] text-foreground outline-none placeholder:text-muted focus-visible:border-accent-blue disabled:opacity-60 sm:w-64"
        />
        <LiquidButton type="submit" size="xl" disabled={status === "loading"} className="w-full rounded-full sm:w-auto">
          {status === "loading" ? (
            "Joining…"
          ) : (
            <>
              Get Creos <span className="cta-arrow">→</span>
            </>
          )}
        </LiquidButton>
      </form>
      {status === "error" && <p className="mt-3 text-center text-sm text-destructive">{message}</p>}
    </div>
  );
}
