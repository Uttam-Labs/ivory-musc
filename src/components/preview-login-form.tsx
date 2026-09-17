"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type PreviewLoginCopy = {
  usernameLabel?: string;
  passwordLabel?: string;
  submitLabel?: string;
  submittingLabel?: string;
  fallbackError?: string;
};

export function PreviewLoginForm({ nextPath = "/", content }: { nextPath?: string; content?: PreviewLoginCopy }) {
  const copy = {
    usernameLabel: "Username",
    passwordLabel: "Password",
    submitLabel: "Enter preview",
    submittingLabel: "Signing in…",
    fallbackError: "Please try again.",
    ...content,
  };
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/preview-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Login failed.");
      const destination = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
      router.replace(destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.fallbackError);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="preview-login-form">
      <div>
        <label htmlFor="preview-username">{copy.usernameLabel}</label>
        <input id="preview-username" name="username" type="text" autoComplete="username" required disabled={loading} />
      </div>
      <div>
        <label htmlFor="preview-password">{copy.passwordLabel}</label>
        <input id="preview-password" name="password" type="password" autoComplete="current-password" required disabled={loading} />
      </div>
      <button type="submit" disabled={loading}>{loading ? copy.submittingLabel : copy.submitLabel}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
