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
type HeroSection = { _type: "faqHero"; image?: ImageData; heading?: string; mobileHeading?: string; body?: string; overlayOpacity?: number };
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
      {hero && <section className={`faq--hero about-hero relative flex min-h-[600px] items-end text-white md:min-h-[450px] xl:min-h-[652px]`}>
        {hero.image && <Image fill priority src={sanityImageUrl(hero.image, 3840)} alt={hero.image.alt || hero.heading || ""} className={styles.heroImage} sizes="100vw" quality={95} />}
        <div className={styles.heroShade} style={{ backgroundColor: `rgba(0,0,0,${Math.min(Math.max(hero.overlayOpacity || 0, 0), 100) / 100})` }} />
        <SiteContainer className={`${styles.heroContent} home-hero-content about-hero-content`}>
          <div className={`home-hero__content-wrap about-hero__content-wrap w-full md:w-4/5 xl:w-1/2`}>{hero.heading && <h1 className="hero-title max-w-[640px] font-heading text-[34px] uppercase leading-tight lg:text-[40px]"><span className="faq-hero__desktop-title">{hero.heading}</span><span className="faq-hero__mobile-title">{hero.mobileHeading || "FAQs"}</span></h1>}{hero.body && <p className="mt-4 w-full max-w-[700px] text-[11px] leading-5 lg:text-xs">{hero.body}</p>}</div>
        </SiteContainer>
      </section>}

      {faq && <SiteContainer as="section" className={`${styles.faqSection} faq-section__main`}>
        <div className="faq-main__container mx-auto w-full max-w-[1600px]">
          {faq.heading && <h2 className="common-heading">{faq.heading}</h2>}
          {faq.items?.length ? <FaqAccordion items={faq.items} defaultOpenItem={faq.defaultOpenItem} /> : null}
        </div>
      </SiteContainer>}

      {cta && <section className={`${styles.cta} faq-mod__cta`}>
        {cta.image && <Image fill src={sanityImageUrl(cta.image, 3840)} alt={cta.image.alt || cta.heading || ""} className={styles.ctaImage} sizes="100vw" quality={95} />}
        <div className={styles.ctaShade} style={{ backgroundColor: `rgba(255,249,243,${Math.min(Math.max(cta.overlayOpacity || 0, 0), 100) / 100})` }} />
        <SiteContainer className={`${styles.ctaContent} faq__cta-content`}>
          {cta.heading && <h2>{cta.heading}</h2>}
          {cta.body && <p>{cta.body}</p>}
          {cta.buttonLabel && cta.buttonHref && <Link href={cta.buttonHref}>{cta.buttonLabel}</Link>}
        </SiteContainer>
      </section>}
    </main>
  );
}
