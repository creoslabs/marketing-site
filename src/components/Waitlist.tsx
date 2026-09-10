"use client";

import { useState, type FormEvent } from "react";
import { LiquidButton } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

type Status = "idle" | "loading" | "success" | "error";

export default function Waitlist() {
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

  return (
    <section id="waitlist" className="relative border-t border-white/10 py-28">
      <Reveal className="mx-auto max-w-xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Be first to get access.
        </h2>
        <p className="mt-4 text-muted">
          Content Lab hasn&apos;t launched yet. Join the waitlist and
          we&apos;ll let you know the moment it&apos;s ready.
        </p>

        {status === "success" ? (
          <p className="mt-8 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-foreground">
            You&apos;re on the list — we&apos;ll be in touch.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              disabled={status === "loading"}
              className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-[15px] text-foreground outline-none placeholder:text-muted focus-visible:border-accent-blue disabled:opacity-60 sm:w-72"
            />
            <LiquidButton
              type="submit"
              size="xl"
              disabled={status === "loading"}
              className="w-full rounded-full sm:w-auto"
            >
              {status === "loading" ? "Joining…" : "Join the waitlist"}
            </LiquidButton>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-destructive">{message}</p>
        )}
      </Reveal>
    </section>
  );
}
