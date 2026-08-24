import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import { ContactForm, type ContactFormSettings } from "@/components/contact-form";
import { SiteContainer } from "@/components/site-container";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { CONTACT_PAGE_QUERY } from "@/sanity/lib/queries";
import styles from "./contact.module.css";

type ImageData = SanityImageSource & { alt?: string };
type HeroSection = { _type: "contactHero"; image?: ImageData; heading?: string; body?: string; overlayOpacity?: number };
type FormSection = ContactFormSettings & { _type: "contactFormSection"; image?: ImageData; heading?: string; body?: string };
type ContactPageData = { title?: string; seoDescription?: string; sections?: Array<HeroSection | FormSection> } | null;

async function getContactPage() {
  return isSanityConfigured ? sanityFetch<ContactPageData>(CONTACT_PAGE_QUERY, {}, ["sanity", "contact-page"]) : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage();
  return { title: page?.title, description: page?.seoDescription };
}

export default async function ContactPage() {
  const page = await getContactPage();
  if (!page) return null;
  const hero = page.sections?.find((section) => section._type === "contactHero") as HeroSection | undefined;
  const formSection = page.sections?.find((section) => section._type === "contactFormSection") as FormSection | undefined;
  return (
    <main className={styles.page}>
      {hero && <section className={`contact--hero about-hero relative flex min-h-[600px] items-end text-white md:min-h-[450px] xl:min-h-[652px]`}>
        {hero.image && <Image fill priority src={sanityImageUrl(hero.image, 2400)} alt={hero.image.alt || hero.heading || ""} className={styles.heroImage} sizes="100vw" />}
        <div className={styles.heroShade} style={{ backgroundColor: `rgba(0,0,0,${Math.min(Math.max(hero.overlayOpacity || 0, 0), 100) / 100})` }} />
        <SiteContainer className={`${styles.heroContent} home-hero-content about-hero-content`}><div className={`home-hero__content-wrap about-hero__content-wrap w-full md:w-4/5 xl:w-1/2`}>{hero.heading && <h1 className="hero-title max-w-[640px] font-heading text-[34px] uppercase leading-tight lg:text-[40px]">{hero.heading}</h1>}{hero.body && <p className="mt-4 w-full max-w-[700px] text-[11px] leading-5 lg:text-xs">{hero.body}</p>}</div></SiteContainer>
      </section>}
      {formSection && <SiteContainer as="section" className={`${styles.contactSection} contact-form__main`}>
        {formSection.image && <div className={`${styles.imageWrap} contact-left-image`}><Image fill src={sanityImageUrl(formSection.image, 1400)} alt={formSection.image.alt || formSection.heading || ""} className={styles.sectionImage} sizes="(min-width:901px) 50vw, 100vw" /></div>}
        <div className={`${styles.formCard} contact-form__card`}>{formSection.heading && <h2>{formSection.heading}</h2>}{formSection.body && <p>{formSection.body}</p>}<ContactForm settings={formSection} /></div>
      </SiteContainer>}
    </main>
  );
}
