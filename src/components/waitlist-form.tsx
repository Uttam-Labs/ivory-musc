"use client";

import { FormEvent, useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
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
        body: JSON.stringify({ email, marketingConsent: consent, website: form.get("website") || "" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Registration failed.");
      setStatus("success");
      setMessage(payload.alreadySubscribed
        ? "You are already on the Ivory Muse waitlist."
        : "Welcome to Ivory Muse. Please check your inbox for our confirmation email.");
      setEmail("");
      setConsent(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
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
        <p className="waitlist-success__eyebrow">Registration confirmed</p>
        <h2>Welcome to Ivory Muse</h2>
        <p>{message}</p>
        <span>We look forward to sharing our world of fine silk with you.</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="waitlist-form">
      <div className="waitlist-form__field">
        <label htmlFor="waitlist-email">Email address</label>
        <div className="waitlist-form__row">
          <input
            id="waitlist-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "loading"}
            required
          />
          <button type="submit" disabled={status === "loading" || !consent}>
            {status === "loading" ? "Joining…" : "Join the waitlist"}
          </button>
        </div>
      </div>
      <label className="waitlist-form__consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          required
        />
        <span>I agree to receive Ivory Muse launch news, collection updates and marketing emails. I can unsubscribe at any time.</span>
      </label>
      <div className="waitlist-form__honeypot" aria-hidden="true">
        <label htmlFor="waitlist-website">Website</label>
        <input id="waitlist-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {message && <p className={`waitlist-form__message waitlist-form__message--${status}`} role="alert">{message}</p>}
    </form>
  );
}
