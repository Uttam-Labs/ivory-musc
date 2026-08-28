import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import { WaitlistForm } from "@/components/waitlist-form";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { WAITLIST_PAGE_QUERY } from "@/sanity/lib/queries";
import styles from "./waitlist.module.css";

type WaitlistContent = {
  seoTitle?: string;
  seoDescription?: string;
  backgroundImage?: SanityImageSource & { alt?: string; assetUrl?: string };
  brandName?: string;
  tagline?: string;
  heading?: string;
  description?: string;
  formHeading?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  confirmationText?: string;
  unsubscribeText?: string;
  successEyebrow?: string;
  successHeading?: string;
  successMessage?: string;
  alreadySubscribedMessage?: string;
  successClosing?: string;
  fallbackErrorMessage?: string;
};

const fallback: Required<Omit<WaitlistContent, "backgroundImage">> = {
  seoTitle: "Coming Soon | Ivory Muse",
  seoDescription: "Join the Ivory Muse list for launch news, considered silk collections and exclusive updates.",
  brandName: "IVORY MUSE",
  tagline: "Exceptional creations\nbegin with exceptional materials.",
  heading: "COMING SOON",
  description: "A considered collection of mulberry silk fabrics\nfor designers, dressmakers & creators.",
  formHeading: "GET ON THE LIST",
  emailLabel: "Email address",
  emailPlaceholder: "EMAIL ADDRESS",
  submitLabel: "JOIN THE LIST",
  submittingLabel: "JOINING…",
  confirmationText: "Be the first to know about our launch, new collections\nand exclusive updates.",
  unsubscribeText: "You can unsubscribe at any time.",
  successEyebrow: "Registration confirmed",
  successHeading: "Welcome to Ivory Muse",
  successMessage: "Welcome to Ivory Muse. Please check your inbox for our confirmation email.",
  alreadySubscribedMessage: "You are already on the Ivory Muse waitlist.",
  successClosing: "We look forward to sharing our world of fine silk with you.",
  fallbackErrorMessage: "We could not join you to the list. Please try again.",
};

async function getContent() {
  const content = isSanityConfigured
    ? await sanityFetch<WaitlistContent | null>(WAITLIST_PAGE_QUERY, {}, ["sanity", "waitlist-page"]).catch(() => null)
    : null;
  const populated = Object.fromEntries(
    Object.entries(content || {}).filter(([, value]) => value !== null && value !== undefined && value !== ""),
  ) as WaitlistContent;
  return { ...fallback, ...populated };
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return { title: content.seoTitle, description: content.seoDescription, robots: { index: true, follow: true } };
}

export default async function WaitlistPage() {
  const content = await getContent();
  const backgroundUrl = content.backgroundImage?.assetUrl || (content.backgroundImage ? sanityImageUrl(content.backgroundImage, 2400) : "/figma/hero.jpg");

  return (
    <main className={`${styles.waitlistPage} waitlist-page`}>
      <Image className={styles.background} src={backgroundUrl} alt={content.backgroundImage?.alt || "Ivory silk being carefully selected in the Ivory Muse studio"} fill priority quality={95} sizes="100vw" unoptimized={Boolean(content.backgroundImage?.assetUrl)} />
      <section className={styles.panel} aria-labelledby="waitlist-title">
        <div className={styles.brand}>{content.brandName}</div>
        <p className={styles.tagline}>{content.tagline}</p>
        <h1 id="waitlist-title">{content.heading}</h1>
        <p className={styles.intro}>{content.description}</p>
        <p className={styles.formTitle}>{content.formHeading}</p>
        <WaitlistForm emailLabel={content.emailLabel} emailPlaceholder={content.emailPlaceholder} submitLabel={content.submitLabel} submittingLabel={content.submittingLabel} successEyebrow={content.successEyebrow} successHeading={content.successHeading} successMessage={content.successMessage} alreadySubscribedMessage={content.alreadySubscribedMessage} successClosing={content.successClosing} fallbackErrorMessage={content.fallbackErrorMessage} />
        <p className={styles.note}>{content.confirmationText}</p>
        <p className={styles.unsubscribe}>{content.unsubscribeText}</p>
      </section>
    </main>
  );
}
