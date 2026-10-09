"use client";

import { useState, type FormEvent } from "react";
import styles from "@/components/site/site.module.css";

type Status = "idle" | "loading" | "success" | "error";

// The one signup mechanism on the site — it lives in the early-access card
// (the `#access` section every "Request access" button points to) so there's
// a single moment where a visitor enters their email.
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
      <p id="get" className={styles.getDone} role="status">
        You&apos;re on the list. We&apos;ll be in touch when a spot opens.
      </p>
    );
  }

  return (
    <form id="get" onSubmit={handleSubmit} className={styles.getForm} noValidate={false}>
      <label htmlFor="get-creos-email" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Email address
      </label>
      <input
        id="get-creos-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        disabled={status === "loading"}
        className={styles.getInput}
      />
      <button type="submit" disabled={status === "loading"} className={`${styles.btn} ${styles.btnInk} ${styles.btnFull}`}>
        {status === "loading" ? "Sending…" : "Request access →"}
      </button>
      {status === "error" && (
        <p className={styles.getErr} role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
