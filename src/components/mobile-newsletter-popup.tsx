"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "@/components/newsletter-form";
import { NEWSLETTER_SUBSCRIBED_KEY } from "@/lib/newsletter-preferences";

const DISMISSED_UNTIL_KEY = "ivory-muse-newsletter-dismissed-until";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;
const MOBILE_QUERY = "(max-width: 767px)";
const SHOW_AFTER_MS = 10_000;
const SHOW_AFTER_SCROLL = 0.35;

type MobileNewsletterPopupProps = {
  heading?: string | null;
  body?: string | null;
  emailLabel?: string | null;
  emailPlaceholder?: string | null;
  submitLabel?: string | null;
  submittingLabel?: string | null;
  alreadySubscribedMessage?: string | null;
  successMessage?: string | null;
  fallbackErrorMessage?: string | null;
  closeLabel?: string | null;
};

const textOr = (value: string | null | undefined, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;

export function MobileNewsletterPopup({
  heading = "JOIN OUR WORLD OF SILK",
  body = "Receive exclusive access to new collections, design inspiration, and stories celebrating the artistry of fine silk.",
  emailLabel = "Email address",
  emailPlaceholder = "Enter your email ID",
  submitLabel = "SUBSCRIBE NOW",
  submittingLabel = "SUBSCRIBING…",
  alreadySubscribedMessage = "You are already subscribed.",
  successMessage = "Thank you for subscribing.",
  fallbackErrorMessage = "Please try again.",
  closeLabel = "Close newsletter pop-up",
}: MobileNewsletterPopupProps) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const copy = {
    heading: textOr(heading, "JOIN OUR WORLD OF SILK"),
    body: textOr(body, "Receive exclusive access to new collections, design inspiration, and stories celebrating the artistry of fine silk."),
    emailLabel: textOr(emailLabel, "Email address"),
    emailPlaceholder: textOr(emailPlaceholder, "Enter your email ID"),
    submitLabel: textOr(submitLabel, "SUBSCRIBE NOW"),
    submittingLabel: textOr(submittingLabel, "SUBSCRIBING…"),
    alreadySubscribedMessage: textOr(alreadySubscribedMessage, "You are already subscribed."),
    successMessage: textOr(successMessage, "Thank you for subscribing."),
    fallbackErrorMessage: textOr(fallbackErrorMessage, "Please try again."),
    closeLabel: textOr(closeLabel, "Close newsletter pop-up"),
  };
  const [open, setOpen] = useState(false);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_FOR_MS));
    } catch {
      // Closing the pop-up should still work if browser storage is unavailable.
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!isHomepage) return;
    if (!window.matchMedia(MOBILE_QUERY).matches) return;
    try {
      if (window.localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY) === "true") return;

      const dismissedUntil = Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY));
      if (Number.isFinite(dismissedUntil) && dismissedUntil > Date.now()) return;
      window.localStorage.removeItem(DISMISSED_UNTIL_KEY);
    } catch {
      // Continue with normal trigger behaviour if browser storage is unavailable.
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      window.removeEventListener("scroll", checkScroll);
      window.clearTimeout(timer);
      setOpen(true);
    };
    const checkScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SHOW_AFTER_SCROLL) show();
    };
    const timer = window.setTimeout(show, SHOW_AFTER_MS);
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", checkScroll);
    };
  }, [isHomepage]);

  useEffect(() => {
    if (!open || !isHomepage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && dismiss();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [dismiss, isHomepage, open]);

  if (!open || !isHomepage) return null;

  return (
    <div className="mobile-newsletter-popup" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && dismiss()}>
      <section role="dialog" aria-modal="true" aria-labelledby="mobile-newsletter-heading" className="mobile-newsletter-popup__dialog">
        <button type="button" onClick={dismiss} className="mobile-newsletter-popup__close" aria-label={copy.closeLabel}>
          <X size={20} strokeWidth={1.5} />
        </button>
        <div className="mobile-newsletter-popup__content">
          <h2 id="mobile-newsletter-heading">{copy.heading}</h2>
          <p className="mobile-newsletter-popup__body">{copy.body}</p>
          <NewsletterForm
            emailLabel={copy.emailLabel}
            placeholder={copy.emailPlaceholder}
            submitLabel={copy.submitLabel}
            submittingLabel={copy.submittingLabel}
            alreadySubscribedMessage={copy.alreadySubscribedMessage}
            successMessage={copy.successMessage}
            fallbackErrorMessage={copy.fallbackErrorMessage}
            onSuccess={() => window.setTimeout(() => setOpen(false), 1400)}
          />
        </div>
      </section>
    </div>
  );
}
