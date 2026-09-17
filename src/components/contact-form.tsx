"use client";

import { FormEvent, useId, useState } from "react";
import { Paperclip, X } from "lucide-react";
import styles from "@/app/contact/contact.module.css";

export type ContactFormSettings = {
  firstNameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  messageLabel?: string;
  submitLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  attachmentLabel?: string;
  attachmentHelp?: string;
  removeAttachmentLabel?: string;
};

export function ContactForm({ settings }: { settings: ContactFormSettings }) {
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [attachmentName, setAttachmentName] = useState("");
  const attachmentId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/contact", { method: "POST", body: data });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      setAttachmentName("");
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      {settings.firstNameLabel && <label><span>{settings.firstNameLabel}<b aria-hidden="true">*</b></span><input name="name" autoComplete="name" required maxLength={120} /></label>}
      {settings.emailLabel && <label><span>{settings.emailLabel}<b aria-hidden="true">*</b></span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
      {settings.phoneLabel && <label><span>{settings.phoneLabel}<b aria-hidden="true">*</b></span><input name="phone" type="tel" autoComplete="tel" required maxLength={40} /></label>}
      {settings.messageLabel && <label><span>{settings.messageLabel}</span><textarea name="message" rows={4} maxLength={3000} /></label>}
      <div className={styles.attachmentField}>
        <input
          id={attachmentId}
          className={styles.fileInput}
          name="attachment"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={(event) => setAttachmentName(event.currentTarget.files?.[0]?.name || "")}
        />
        <label className={styles.attachmentButton} htmlFor={attachmentId}>
          <Paperclip size={18} aria-hidden="true" />
          <span>{settings.attachmentLabel || "Attach A File"}</span>
        </label>
        {attachmentName && (
          <div className={styles.attachmentName}>
            <span>{attachmentName}</span>
            <button
              type="button"
              aria-label={settings.removeAttachmentLabel || "Remove attachment"}
              onClick={() => {
                const input = document.getElementById(attachmentId) as HTMLInputElement | null;
                if (input) input.value = "";
                setAttachmentName("");
              }}
            ><X size={16} /></button>
          </div>
        )}
        <small>{settings.attachmentHelp || "Optional. JPG, PNG, WEBP or HEIC, up to 4MB."}</small>
      </div>
      <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {settings.submitLabel && <button type="submit" disabled={state === "submitting"}>{state === "submitting" ? `${settings.submitLabel}…` : settings.submitLabel}</button>}
      <div className={styles.formStatus} aria-live="polite">
        {state === "success" && settings.successMessage && <p className={styles.success}>{settings.successMessage}</p>}
        {state === "error" && settings.errorMessage && <p className={styles.error}>{settings.errorMessage}</p>}
      </div>
    </form>
  );
}
