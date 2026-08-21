"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PreviewLoginForm({ nextPath = "/" }: { nextPath?: string }) {
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
      setError(cause instanceof Error ? cause.message : "Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="preview-login-form">
      <div>
        <label htmlFor="preview-username">Username</label>
        <input id="preview-username" name="username" type="text" autoComplete="username" required disabled={loading} />
      </div>
      <div>
        <label htmlFor="preview-password">Password</label>
        <input id="preview-password" name="password" type="password" autoComplete="current-password" required disabled={loading} />
      </div>
      <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Enter preview"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
