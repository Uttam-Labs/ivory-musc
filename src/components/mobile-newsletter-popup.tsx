"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { WaitlistForm } from "@/components/waitlist-form";
import { NEWSLETTER_SUBSCRIBED_KEY } from "@/lib/newsletter-preferences";

const DISMISSED_THIS_VISIT_KEY = "ivory-muse-newsletter-dismissed-this-visit";
const MOBILE_QUERY = "(max-width: 767px)";
const SHOW_AFTER_MS = 10_000;
const SHOW_AFTER_SCROLL = 0.35;

type MobileNewsletterPopupProps = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  consentText?: string;
  alreadySubscribedMessage?: string;
  successMessage?: string;
  fallbackErrorMessage?: string;
  closeLabel?: string;
};

export function MobileNewsletterPopup({
  eyebrow = "Ivory Muse Privileges",
  heading = "Private offers await",
  body = "Subscribe for exclusive offers, early access to new arrivals and private Ivory Muse promotions.",
  imageUrl = "/figma/hero.jpg",
  imageAlt = "Ivory silk in the Ivory Muse studio",
  emailLabel = "Email address",
  emailPlaceholder = "EMAIL ADDRESS",
  submitLabel = "UNLOCK EXCLUSIVE ACCESS",
  submittingLabel = "SUBSCRIBING…",
  consentText,
  alreadySubscribedMessage = "You are already subscribed to Ivory Muse offers.",
  successMessage = "You're in. Watch your inbox for exclusive Ivory Muse offers.",
  fallbackErrorMessage,
  closeLabel = "Close mailing list pop-up",
}: MobileNewsletterPopupProps) {
  const [open, setOpen] = useState(false);

  const dismiss = useCallback(() => {
    try {
      window.sessionStorage.setItem(DISMISSED_THIS_VISIT_KEY, "true");
    } catch {
      // Closing the pop-up should still work if browser storage is unavailable.
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!window.matchMedia(MOBILE_QUERY).matches) return;
    try {
      if (
        window.localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY) === "true" ||
        window.sessionStorage.getItem(DISMISSED_THIS_VISIT_KEY) === "true"
      ) return;
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
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && dismiss();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [dismiss, open]);

  if (!open) return null;

  return (
    <div className="mobile-newsletter-popup" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && dismiss()}>
      <section role="dialog" aria-modal="true" aria-labelledby="mobile-newsletter-heading" className="mobile-newsletter-popup__dialog">
        <button type="button" onClick={dismiss} className="mobile-newsletter-popup__close" aria-label={closeLabel}>
          <X size={21} strokeWidth={1.5} />
        </button>
        <div className="mobile-newsletter-popup__image">
          <Image src={imageUrl} alt={imageAlt} fill sizes="410px" quality={95} />
        </div>
        <div className="mobile-newsletter-popup__content">
          <p className="mobile-newsletter-popup__eyebrow">{eyebrow}</p>
          <h2 id="mobile-newsletter-heading">{heading}</h2>
          <p className="mobile-newsletter-popup__body">{body}</p>
          <WaitlistForm
            emailLabel={emailLabel}
            emailPlaceholder={emailPlaceholder}
            submitLabel={submitLabel}
            submittingLabel={submittingLabel}
            consentText={consentText}
            alreadySubscribedMessage={alreadySubscribedMessage}
            successMessage={successMessage}
            fallbackErrorMessage={fallbackErrorMessage}
            onSuccess={() => window.setTimeout(() => setOpen(false), 1400)}
          />
        </div>
      </section>
    </div>
  );
}
