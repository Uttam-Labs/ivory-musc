"use client";

import { FormEvent, useState } from "react";

type WaitlistFormProps = {
  emailLabel?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  successEyebrow?: string;
  successHeading?: string;
  successMessage?: string;
  alreadySubscribedMessage?: string;
  successClosing?: string;
  fallbackErrorMessage?: string;
};

export function WaitlistForm({
  emailLabel = "Email address",
  emailPlaceholder = "EMAIL ADDRESS",
  submitLabel = "JOIN THE LIST",
  submittingLabel = "JOINING…",
  successEyebrow = "Registration confirmed",
  successHeading = "Welcome to Ivory Muse",
  successMessage = "Welcome to Ivory Muse. Please check your inbox for our confirmation email.",
  alreadySubscribedMessage = "You are already on the Ivory Muse waitlist.",
  successClosing = "We look forward to sharing our world of fine silk with you.",
  fallbackErrorMessage = "We could not join you to the list. Please try again.",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, marketingConsent: true, website: form.get("website") || "" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Registration failed.");
      setStatus("success");
      setMessage(payload.alreadySubscribed
        ? alreadySubscribedMessage
        : successMessage);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(fallbackErrorMessage);
    }
  }

  if (status === "success") {
    return (
      <div className="waitlist-success" role="status" aria-live="polite">
        <div className="waitlist-success__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
            <path d="m6.5 12.5 3.4 3.4 7.6-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="waitlist-success__eyebrow">{successEyebrow}</p>
        <h2>{successHeading}</h2>
        <p>{message}</p>
        <span>{successClosing}</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="waitlist-form">
      <div className="waitlist-form__field">
        <label htmlFor="waitlist-email">{emailLabel}</label>
        <div className="waitlist-form__row">
          <input
            id="waitlist-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "loading"}
            required
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
      <div className="waitlist-form__honeypot" aria-hidden="true">
        <label htmlFor="waitlist-website">Website</label>
        <input id="waitlist-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {message && <p className={`waitlist-form__message waitlist-form__message--${status}`} role="alert">{message}</p>}
    </form>
  );
}
