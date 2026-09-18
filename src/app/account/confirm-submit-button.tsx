"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./account.module.css";

export function ConfirmSubmitButton({
  message,
  children,
  className,
  matchFields,
  title = "Please confirm",
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  passwordMismatchMessage = "Passwords do not match.",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
  matchFields?: readonly [string, string];
  title?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  passwordMismatchMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={(event) => {
          const form = event.currentTarget.form;
          if (!form || !form.reportValidity()) return;
          if (matchFields && form) {
            const first = form.elements.namedItem(
              matchFields[0],
            ) as HTMLInputElement | null;
            const second = form.elements.namedItem(
              matchFields[1],
            ) as HTMLInputElement | null;
            second?.setCustomValidity("");
            if (first && second && first.value !== second.value) {
              second.setCustomValidity(passwordMismatchMessage);
              second.reportValidity();
              return;
            }
          }
          formRef.current = form;
          setOpen(true);
        }}
      >
        {children}
      </button>
      {open && (
        <div
          className={styles.confirmBackdrop}
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <section
            className={styles.confirmDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className={styles.confirmMark}>IM</span>
            <h2 id="account-confirm-title">{title}</h2>
            <p>{message}</p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={() => setOpen(false)}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={styles.confirmAccept}
                autoFocus
                onClick={() => {
                  setOpen(false);
                  formRef.current?.requestSubmit();
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
