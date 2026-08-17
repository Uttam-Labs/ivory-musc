"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm({ placeholder, submitLabel }: { placeholder?: string; submitLabel?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Subscription failed.");
      setStatus("success");
      setMessage(payload.alreadySubscribed ? "You are already subscribed." : "Thank you for subscribing.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <div className="mt-8 w-full max-w-md">
      <form onSubmit={submit} className="flex items-stretch border-b border-[var(--accent)]/60">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          disabled={status === "loading"}
          className="min-w-0 flex-1 bg-transparent px-1 py-3 text-[10px] outline-none placeholder:text-[var(--accent)]/80 disabled:opacity-60"
        />
        {submitLabel && (
          <button disabled={status === "loading"} className="ml-4 min-w-[132px] border-l border-[var(--accent)]/70 px-4 text-[10px] uppercase tracking-[.06em] text-[var(--accent)] underline decoration-[1px] underline-offset-[3px] transition-opacity hover:opacity-60 disabled:cursor-wait disabled:opacity-50">
            {status === "loading" ? "Subscribing…" : submitLabel}
          </button>
        )}
      </form>
      {message && <p role="status" className={`mt-3 text-left text-[10px] ${status === "error" ? "text-red-700" : "text-[var(--accent)]"}`}>{message}</p>}
    </div>
  );
}
