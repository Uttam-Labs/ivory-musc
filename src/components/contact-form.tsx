"use client";

import { FormEvent, useState } from "react";
import styles from "@/app/contact/contact.module.css";

export type ContactFormSettings = {
  firstNameLabel?: string;
  lastNameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  messageLabel?: string;
  submitLabel?: string;
  successMessage?: string;
  errorMessage?: string;
};

export function ContactForm({ settings }: { settings: ContactFormSettings }) {
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.nameFields}>
        {settings.firstNameLabel && <label><span>{settings.firstNameLabel}<b aria-hidden="true">*</b></span><input name="firstName" autoComplete="given-name" required maxLength={80} /></label>}
        {settings.lastNameLabel && <label><span>{settings.lastNameLabel}<b aria-hidden="true">*</b></span><input name="lastName" autoComplete="family-name" required maxLength={80} /></label>}
      </div>
      {settings.emailLabel && <label><span>{settings.emailLabel}<b aria-hidden="true">*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
      {settings.phoneLabel && <label><span>{settings.phoneLabel}<b aria-hidden="true">*</b></span><input name="phone" type="tel" autoComplete="tel" required maxLength={40} /></label>}
      {settings.messageLabel && <label><span>{settings.messageLabel}</span><textarea name="message" rows={4} maxLength={3000} /></label>}
      <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {settings.submitLabel && <button type="submit" disabled={state === "submitting"}>{state === "submitting" ? `${settings.submitLabel}…` : settings.submitLabel}</button>}
      <div className={styles.formStatus} aria-live="polite">
        {state === "success" && settings.successMessage && <p className={styles.success}>{settings.successMessage}</p>}
        {state === "error" && settings.errorMessage && <p className={styles.error}>{settings.errorMessage}</p>}
      </div>
    </form>
  );
}
