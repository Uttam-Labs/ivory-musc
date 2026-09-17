import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import { PreviewLoginForm, type PreviewLoginCopy } from "@/components/preview-login-form";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { HEADER_SETTINGS_QUERY, STOREFRONT_CONTENT_QUERY } from "@/sanity/lib/queries";
import styles from "./preview-login.module.css";

type PreviewPageContent = PreviewLoginCopy & {
  seoTitle?: string;
  logoFallback?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
};

const fallback: Required<PreviewPageContent> = {
  seoTitle: "Private Preview", logoFallback: "IVORY MUSE", eyebrow: "Private website preview",
  heading: "Welcome to Ivory Muse", intro: "Please enter the preview credentials provided to you.",
  usernameLabel: "Username", passwordLabel: "Password", submitLabel: "Enter preview",
  submittingLabel: "Signing in…", fallbackError: "Please try again.",
};

async function getPreviewContent() {
  const data = isSanityConfigured
    ? await sanityFetch<{ previewLoginPage?: PreviewPageContent } | null>(STOREFRONT_CONTENT_QUERY, {}, ["sanity", "storefront-content"])
    : null;
  return { ...fallback, ...data?.previewLoginPage };
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPreviewContent();
  return { title: content.seoTitle, robots: { index: false, follow: false } };
}

export default async function PreviewLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : "/";
  const [header, content] = await Promise.all([
    isSanityConfigured
      ? sanityFetch<{ logo?: SanityImageSource; title?: string }>(HEADER_SETTINGS_QUERY, {}, ["sanity", "header"])
      : null,
    getPreviewContent(),
  ]);
  const logoUrl = header?.logo ? sanityImageUrl(header.logo, 420) : undefined;

  return (
    <main className={`${styles.page} preview-login-page`}>
      <section className={styles.card}>
        <div className={styles.logo}>
          {logoUrl ? <Image src={logoUrl} width={280} height={248} quality={95} sizes="140px" alt={header?.title || content.logoFallback} priority /> : <span>{content.logoFallback}</span>}
        </div>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h1>{content.heading}</h1>
        <p className={styles.intro}>{content.intro}</p>
        <PreviewLoginForm nextPath={nextPath} content={content} />
      </section>
    </main>
  );
}
