"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import styles from "./account.module.css";

export function AccountFeedback({
  success,
  error,
  clearQuery = false,
}: {
  success?: string;
  error?: string;
  clearQuery?: boolean;
}) {
  const message = error || success;
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setVisible(false), 6000);
    if (clearQuery) {
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("error");
      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
    return () => window.clearTimeout(timer);
  }, [message, clearQuery]);
  if (!message || !visible) return null;
  return (
    <div
      className={`${styles.feedbackToast} ${error ? styles.feedbackError : styles.feedbackSuccess}`}
      role={error ? "alert" : "status"}
    >
      <span className={styles.feedbackIcon}>
        {error ? <X size={18} /> : <Check size={18} />}
      </span>
      <div>
        <strong>{error ? "Please check" : "Success"}</strong>
        <p>{message}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss message"
        onClick={() => setVisible(false)}
      >
        <X size={17} />
      </button>
    </div>
  );
}
