"use client";

import { FormEvent, useId, useState } from "react";
import { NEWSLETTER_SUBSCRIBED_KEY } from "@/lib/newsletter-preferences";

type NewsletterFormProps = {
  emailLabel?: string;
  placeholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  successMessage?: string;
  alreadySubscribedMessage?: string;
  fallbackErrorMessage?: string;
  onSuccess?: () => void;
};

export function NewsletterForm({
  emailLabel = "Email address", placeholder, submitLabel, submittingLabel = "Subscribing…",
  successMessage = "Thank you for subscribing.", alreadySubscribedMessage = "You are already subscribed.",
  fallbackErrorMessage = "Please try again.", onSuccess,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputId = useId();

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
      setMessage(payload.alreadySubscribed ? alreadySubscribedMessage : successMessage);
      try {
        window.localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, "true");
      } catch {
        // The subscription still succeeded if browser storage is unavailable.
      }
      onSuccess?.();
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : fallbackErrorMessage);
    }
  }

  return (
    <div className="newsletter-form__wrapper mt-8 w-full max-w-[100%]">
      <form onSubmit={submit} className="flex items-stretch border-b border-[var(--accent)]/60 pb-3">
        <label htmlFor={inputId} className="sr-only">{emailLabel}</label>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          disabled={status === "loading"}
          className="field__input min-w-0 flex-1 bg-transparent px-1 py-3 text-[10px] outline-none placeholder:text-[var(--accent)]/80 disabled:opacity-60"
        />
        {submitLabel && (
          <button disabled={status === "loading"} className="newsletter-button ml-4 min-w-[132px] border-l border-[var(--accent)]/70 px-4 text-[10px] uppercase tracking-[.06em] text-[var(--accent)] underline decoration-[1px] underline-offset-[3px] transition-opacity hover:opacity-60 disabled:cursor-wait disabled:opacity-50">
            {status === "loading" ? submittingLabel : submitLabel}
          </button>
        )}
      </form>
      {message && <p role="status" className={`mt-3 text-left text-[10px] ${status === "error" ? "text-red-700" : "text-[var(--accent)]"}`}>{message}</p>}
    </div>
  );
}
