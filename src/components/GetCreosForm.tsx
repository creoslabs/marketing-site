"use client";

import { useState, type FormEvent } from "react";
import styles from "@/components/home/home.module.css";

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
      <p className={styles.signupDone}>
        You&apos;re on the list — we&apos;ll be in touch.
      </p>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className={styles.signup}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          disabled={status === "loading"}
          className={styles.signupInput}
        />
        <button type="submit" disabled={status === "loading"} className={styles.btn}>
          {status === "loading" ? (
            "Joining…"
          ) : (
            <>
              Get Creos <span className="cta-arrow">→</span>
            </>
          )}
        </button>
      </form>
      {status === "error" && <p className={styles.signupErr}>{message}</p>}
    </div>
  );
}
