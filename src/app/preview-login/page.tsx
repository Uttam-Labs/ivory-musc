import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import { PreviewLoginForm } from "@/components/preview-login-form";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { HEADER_SETTINGS_QUERY } from "@/sanity/lib/queries";
import styles from "./preview-login.module.css";

export const metadata: Metadata = {
  title: "Private Preview",
  robots: { index: false, follow: false },
};

export default async function PreviewLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : "/";
  const header = isSanityConfigured
    ? await sanityFetch<{ logo?: SanityImageSource; title?: string }>(HEADER_SETTINGS_QUERY, {}, ["sanity", "header"])
    : null;
  const logoUrl = header?.logo ? sanityImageUrl(header.logo, 420) : undefined;

  return (
    <main className={`${styles.page} preview-login-page`}>
      <section className={styles.card}>
        <div className={styles.logo}>
          {logoUrl ? <Image src={logoUrl} width={140} height={124} alt={header?.title || "Ivory Muse"} priority /> : <span>IVORY MUSE</span>}
        </div>
        <p className={styles.eyebrow}>Private website preview</p>
        <h1>Welcome to Ivory Muse</h1>
        <p className={styles.intro}>Please enter the preview credentials provided to you.</p>
        <PreviewLoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
