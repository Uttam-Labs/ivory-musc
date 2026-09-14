"use client";

import { FormEvent, useId, useState } from "react";
import { NEWSLETTER_SUBSCRIBED_KEY } from "@/lib/newsletter-preferences";

type WaitlistFormProps = {
  emailLabel?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  consentText?: string;
  successEyebrow?: string;
  successHeading?: string;
  successMessage?: string;
  alreadySubscribedMessage?: string;
  successClosing?: string;
  fallbackErrorMessage?: string;
  onSuccess?: () => void;
};

export function WaitlistForm({
  emailLabel = "Email address",
  emailPlaceholder = "EMAIL ADDRESS",
  submitLabel = "JOIN THE LIST",
  submittingLabel = "JOINING…",
  consentText = "I agree to receive emails from Ivory Muse about new collections, restocks, exclusive offers and brand updates. I can unsubscribe at any time.",
  successHeading = "Welcome to Ivory Muse",
  alreadySubscribedMessage = "You are already on the Ivory Muse waitlist.",
  fallbackErrorMessage = "We could not join you to the list. Please try again.",
  onSuccess,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const emailId = useId();
  const websiteId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, marketingConsent, website: form.get("website") || "" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Registration failed.");
      setStatus("success");
      setMessage(payload.alreadySubscribed
        ? alreadySubscribedMessage
        : `${successHeading}. Your place on our waitlist is confirmed.`);
      try {
        window.localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, "true");
      } catch {
        // The waitlist registration still succeeded if browser storage is unavailable.
      }
      onSuccess?.();
      setEmail("");
      setMarketingConsent(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.message
        ? error.message
        : fallbackErrorMessage);
    }
  }

  if (status === "success") {
    return (
      <div className="waitlist-success" role="status" aria-live="polite">
        <div className="waitlist-success__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="m6.5 12.5 3.4 3.4 7.6-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="waitlist-form">
      <div className="waitlist-form__field">
        <label htmlFor={emailId}>{emailLabel}</label>
        <div className="waitlist-form__row">
          <input
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "loading"}
            required
          />
          <button
            type="submit"
            className={status === "loading" ? "waitlist-form__submit--loading" : undefined}
            disabled={status === "loading"}
            aria-busy={status === "loading"}
          >
            {status === "loading" ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
      <div className="waitlist-form__honeypot" aria-hidden="true">
        <label htmlFor={websiteId}>Website</label>
        <input id={websiteId} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="waitlist-form__consent">
        <input
          type="checkbox"
          name="marketingConsent"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
          disabled={status === "loading"}
          required
        />
        <span>{consentText}</span>
      </label>
      {message && <p className={`waitlist-form__message waitlist-form__message--${status}`} role="alert">{message}</p>}
    </form>
  );
}
