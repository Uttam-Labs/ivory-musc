import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";
import { FaqAccordion, type FaqItem } from "@/components/faq-accordion";
import { SiteContainer } from "@/components/site-container";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { FAQ_PAGE_QUERY } from "@/sanity/lib/queries";
import styles from "./faq.module.css";

type ImageData = SanityImageSource & { alt?: string };
type HeroSection = { _type: "faqHero"; image?: ImageData; heading?: string; body?: string; overlayOpacity?: number };
type AccordionSection = { _type: "faqAccordion"; heading?: string; defaultOpenItem?: number; items?: FaqItem[] };
type CtaSection = { _type: "faqCta"; image?: ImageData; heading?: string; body?: string; buttonLabel?: string; buttonHref?: string; overlayOpacity?: number };
type FaqPageData = { title?: string; seoDescription?: string; sections?: Array<HeroSection | AccordionSection | CtaSection> } | null;

async function getFaqPage() {
  return isSanityConfigured ? sanityFetch<FaqPageData>(FAQ_PAGE_QUERY, {}, ["sanity", "faq-page"]) : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFaqPage();
  return { title: page?.title, description: page?.seoDescription };
}

export default async function FaqPage() {
  const page = await getFaqPage();
  if (!page) return null;
  const hero = page.sections?.find((section) => section._type === "faqHero") as HeroSection | undefined;
  const faq = page.sections?.find((section) => section._type === "faqAccordion") as AccordionSection | undefined;
  const cta = page.sections?.find((section) => section._type === "faqCta") as CtaSection | undefined;

  return (
    <main className={styles.page}>
      {hero && <section className={styles.hero}>
        {hero.image && <Image fill priority src={sanityImageUrl(hero.image, 2400)} alt={hero.image.alt || hero.heading || ""} className={styles.heroImage} sizes="100vw" />}
        <div className={styles.heroShade} style={{ backgroundColor: `rgba(0,0,0,${Math.min(Math.max(hero.overlayOpacity || 0, 0), 100) / 100})` }} />
        <SiteContainer className={styles.heroContent}>
          <div className={styles.heroText}>{hero.heading && <h1>{hero.heading}</h1>}{hero.body && <p>{hero.body}</p>}</div>
        </SiteContainer>
      </section>}

      {faq && <SiteContainer as="section" className={styles.faqSection}>
        {faq.heading && <h2>{faq.heading}</h2>}
        {faq.items?.length ? <FaqAccordion items={faq.items} defaultOpenItem={faq.defaultOpenItem} /> : null}
      </SiteContainer>}

      {cta && <section className={styles.cta}>
        {cta.image && <Image fill src={sanityImageUrl(cta.image, 2400)} alt={cta.image.alt || cta.heading || ""} className={styles.ctaImage} sizes="100vw" />}
        <div className={styles.ctaShade} style={{ backgroundColor: `rgba(255,249,243,${Math.min(Math.max(cta.overlayOpacity || 0, 0), 100) / 100})` }} />
        <SiteContainer className={styles.ctaContent}>
          {cta.heading && <h2>{cta.heading}</h2>}
          {cta.body && <p>{cta.body}</p>}
          {cta.buttonLabel && cta.buttonHref && <Link href={cta.buttonHref}>{cta.buttonLabel}</Link>}
        </SiteContainer>
      </section>}
    </main>
  );
}
