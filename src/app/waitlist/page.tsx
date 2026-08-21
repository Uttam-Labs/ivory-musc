import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import { WaitlistForm } from "@/components/waitlist-form";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { HEADER_SETTINGS_QUERY } from "@/sanity/lib/queries";
import styles from "./waitlist.module.css";

export const metadata: Metadata = {
  title: "Join the Ivory Muse Waitlist",
  description: "Join the Ivory Muse waitlist for early access to our launch, collections and stories from the world of fine silk.",
  robots: { index: true, follow: true },
};

export default async function WaitlistPage() {
  const header = isSanityConfigured
    ? await sanityFetch<{ logo?: SanityImageSource; title?: string }>(HEADER_SETTINGS_QUERY, {}, ["sanity", "header"])
    : null;
  const logoUrl = header?.logo ? sanityImageUrl(header.logo, 420) : undefined;

  return (
    <main className={`${styles.waitlistPage} waitlist-page`}>
      <div className={styles.ambient} aria-hidden="true" />
      <section className={styles.panel}>
        <div className={styles.brand}>
          {logoUrl ? (
            <Image src={logoUrl} alt={header?.title || "Ivory Muse"} width={150} height={132} priority />
          ) : (
            <span>IVORY MUSE</span>
          )}
        </div>
        <div className={styles.eyebrow}>A new expression of timeless silk</div>
        <h1>Join our world of silk</h1>
        <p className={styles.intro}>Be the first to discover the Ivory Muse launch, thoughtfully curated collections and stories celebrating the artistry of fine silk.</p>
        <WaitlistForm />
        <p className={styles.note}>Early access · Collection previews · Ivory Muse stories</p>
      </section>
      <p className={styles.copyright}>© {new Date().getFullYear()} Ivory Muse</p>
    </main>
  );
}
