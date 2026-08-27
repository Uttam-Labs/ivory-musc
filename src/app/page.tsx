import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";
import { CollectionSlider } from "@/components/collection-slider";
import { NewsletterForm } from "@/components/newsletter-form";
import { isSanityConfigured, isShopifyConfigured } from "@/lib/env";
import { getCollection } from "@/lib/shopify";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";

type Section = {
  _key?: string;
  _type: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  image?: SanityImageSource;
  layout?: "split" | "banner";
  imagePosition?: "left" | "right";
  collectionHandle?: string;
  autoSlide?: boolean;
  slideInterval?: number;
  emailPlaceholder?: string;
  submitLabel?: string;
  features?: Array<{ title?: string; icon?: SanityImageSource }>;
};
type HomeContent = { sections?: Section[] } | null;

function Button({
  label,
  href,
  light = false,
  variant = "primary",
  className = "",
}: {
  label?: string;
  href?: string;
  light?: boolean;
  variant?: "primary" | "secondary" | "solid";
  className?: string;
}) {
  if (!label || !href) return null;
  const primary = light
    ? "border-white bg-white text-stone-800 hover:bg-transparent hover:text-white"
    : "border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white";
  const secondary = light
    ? "border-white/80 bg-transparent text-white hover:bg-white hover:text-stone-800"
    : "border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white";
  const solid =
    "border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-transparent hover:text-[var(--accent)]";
  const buttonStyle =
    variant === "solid" ? solid : variant === "primary" ? primary : secondary;
  return (
    <Link
      href={href}
      className={`mt-6 inline-flex h-[38px] items-center justify-center border px-7 text-center text-[10px] font-medium uppercase tracking-[.12em] transition-all duration-300 ${buttonStyle} ${className}`}
    >
      {label}
    </Link>
  );
}

export default async function Home() {
  const cms = isSanityConfigured
    ? await sanityFetch<HomeContent>(HOME_PAGE_QUERY)
    : null;
  const sections = cms?.sections || [];
  const collectionHandle = sections.find(
    (section) => section._type === "collectionSlider",
  )?.collectionHandle;
  const collection =
    isShopifyConfigured && collectionHandle
      ? await getCollection(collectionHandle, 24)
      : null;
  const products = collection?.products.nodes || [];
  return (
    <main className="home-page flex-1 overflow-hidden bg-[#fff9f3]">
      {sections.map((section, index) => {
        const key = section._key || index;
        if (section._type === "hero")
          return (
            <section
              key={key}
              className="home-hero relative flex min-h-[600px] items-end text-white md:aspect-[2/1] md:min-h-0 md:max-h-[820px]"
            >
              {section.image && (
                <Image
                  src={sanityImageUrl(section.image, 3840)}
                  alt={section.heading || "Ivory Muse silk fabric"}
                  fill
                  priority
                  quality={95}
                  className="home-hero-media object-cover md:hidden"
                  sizes="100vw"
                />
              )}
              <Image
                src="/media/ivory-muse-hero.gif"
                alt={section.heading || "Ivory Muse silk fabric"}
                fill
                priority={!section.image}
                unoptimized
                className={`home-hero-media object-cover ${section.image ? "hidden md:block" : ""}`}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/15" />
              <div className="home-hero-content relative mx-auto w-full max-w-[1920] px-6 sm:px-12 xl:px-24 pb-16 md:pb-20 lg:pb-36">
                <div className="home-hero__content-wrap w-full md:w-4/5 xl:w-1/2">
                  {section.heading && (
                    <h1 className="hero-title max-w-full text-[25px] uppercase leading-tight sm:text-[28px] lg:whitespace-nowrap">
                      {section.heading}
                    </h1>
                  )}
                  {section.body && (
                    <p className="mt-3 w-full max-w-[100%] whitespace-pre-line text-[11px] leading-5 sm:text-xs">
                      {section.body}
                    </p>
                  )}
                  <div className="home-hero__buttons flex flex-wrap gap-3">
                    <Button
                      label={section.buttonLabel}
                      href={section.buttonHref}
                      className="button custom-button btn-white"
                      light
                    />
                    <Button
                      label={section.secondaryButtonLabel}
                      href={section.secondaryButtonHref}
                      className="button custom-button btn-transparent"
                      light
                      variant="secondary"
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        if (section._type === "collectionSlider") {
          if (!products.length) return null;
          return (
            <section
              key={key}
              className="home-bestseller mx-auto max-w-[1920] px-6 sm:px-12 lg:px-28 bg-[#fff9f3] py-16 lg:py-36"
            >
              {(section.heading || section.intro) && (
                <header className="section__heading mb-10 text-center">
                  {section.heading && (
                    <h2 className="text-[20px] uppercase text-[var(--accent)]">
                      {section.heading}
                    </h2>
                  )}
                  {section.intro && (
                    <p className="mt-2 text-[10px]">{section.intro}</p>
                  )}
                </header>
              )}
              <CollectionSlider
                products={products}
                slideInterval={section.slideInterval}
              />
            </section>
          );
        }
        if (section._type === "centeredStory") {
          const storyParagraphs = section.body
            ?.split(/\n\s*\n/)
            .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
            .filter(Boolean);
          return (
            <section
              key={key}
              className="home-story mx-auto max-w-[1440px] bg-[#fff9f3] px-6 sm:px-12 xl:px-24 py-16 text-center lg:py-36"
            >
              <header className="section__heading mb-0 text-center">
                {section.heading && (
                  <h2 className="text-[22px] uppercase text-[var(--accent)]">
                    {section.heading}
                  </h2>
                )}
                {storyParagraphs?.length ? (
                  <div className="mt-5 mb-5 space-y-3">
                    {storyParagraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                <Button className="custom-button" label={section.buttonLabel} href={section.buttonHref} />
              </header>
            </section>
          );
        }
        if (section._type === "featureGuide")
          return (
            <section
              key={key}
              className="home-guide mx-auto max-w-[1920] px-6 sm:px-12 xl:px-24 bg-[#fff9f3] py-16 text-center lg:py-36"
            >
              <div className="max-w-[1050px] mx-auto">
                {section.heading && (
                  <h2 className="text-[22px] uppercase text-[var(--accent)] common-heading">
                    {section.heading}
                  </h2>
                )}
                {section.body && (
                  <p className="">
                    {section.body}
                  </p>
                )}
                <Button
                  label={section.buttonLabel}
                  href={section.buttonHref}
                  className="custom-button"
                  variant="solid"
                />
              </div>
              {section.features?.length ? (
                <div className="text-icons mt-12 lg:mt-36 grid grid-cols-2 gap-8 lg:gap-12 sm:grid-cols-3 lg:grid-cols-6">
                  {section.features.map((feature, i) => (
                    <div key={feature.title || i}>
                      {feature.icon && (
                        <div className="relative mx-auto size-[45px] xl:size-[90px]">
                          <Image
                            fill
                            src={sanityImageUrl(feature.icon, 180)}
                            alt=""
                            className="object-contain"
                            sizes="90px"
                            quality={95}
                          />
                        </div>
                      )}
                      {feature.title && (
                        <p className="icon-text-title text-[var(--accent)]">
                          {feature.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          );
        if (section._type === "newsletter")
          return (
            <section
              key={key}
              className="home-newsletter grid bg-[#fff9f3] md:min-h-[659px] md:grid-cols-[45%_55%]"
            >
              <div className="flex flex-col items-center justify-center bg-[#fff5ea] px-6 sm:px-12 xl:px-24 py-14 text-center md:py-16">
                <div className="newsletter-wrapper max-w-[570px] mx-auto">
                  {section.heading && (
                    <h2 className="common-heading text-[var(--accent)]">
                      {section.heading}
                    </h2>
                  )}
                  {section.body && (
                    <p className="">
                      {section.body}
                    </p>
                  )}
                  <NewsletterForm
                    placeholder={section.emailPlaceholder}
                    submitLabel={section.submitLabel}
                  />
                </div>
              </div>
              {section.image && (
                <div className="relative min-h-[280px] sm:min-h-80">
                  <Image
                    fill
                    src={sanityImageUrl(section.image, 3200)}
                    alt={section.heading || ""}
                    className="object-cover"
                    sizes="(min-width: 768px) 55vw, 100vw"
                    quality={95}
                  />
                </div>
              )}
            </section>
          );
        if (section._type === "imageText") {
          const isCampaignBanner =
            section.layout === "banner" || section._key === "craft";
          if (isCampaignBanner)
            return (
              <section
                key={key}
                className="home-campaign relative flex min-h-[420px] w-full items-center justify-end overflow-hidden text-white sm:aspect-[16/8] sm:min-h-0 md:aspect-[12/5]"
              >
                {section.image && (
                  <Image
                    fill
                    src={sanityImageUrl(section.image, 3840)}
                    alt={section.heading || ""}
                    className="object-cover object-center"
                    sizes="100vw"
                    quality={95}
                  />
                )}
                <div className="absolute inset-0 bg-black/15" />
                <div className="home-campaign-text relative mx-auto w-[100%] max-w-[1920] px-6 sm:px-12 xl:px-24 text-center">
                  <div className="flex flex-col items-center w-full md:w-[450] md:ml-auto lg:w-1/2">
                  {section.heading && (
                    <h2 className="common-heading max-w-[620] mx-auto">
                      {section.heading}
                    </h2>
                  )}
                  {section.body && (
                    <p>
                      {section.body}
                    </p>
                  )}
                  <Button
                    label={section.buttonLabel}
                    href={section.buttonHref}
                    className="custom-button btn-white"
                    light
                  />
                  </div>
                </div>
              </section>
            );
          const reverse = section.imagePosition === "right";
          const isChosen = section._key === "chosen";
          return (
            <section
              key={key}
              className={`home-split mx-auto grid max-w-[100%] items-start bg-[#fff9f3] lg:grid-cols-2 ${isChosen ? "home-chosen pt-20 pb-10 sm:pt-24 lg:pt-36 lg:pb-0" : "home-philosophy"}`}
            >
              {section.image && (
                <div
                  className={`home-split-image relative aspect-[1.65/1] w-full ${reverse ? "md:order-2" : ""}`}
                >
                  <Image
                    fill
                    src={sanityImageUrl(section.image, 3200)}
                    alt={section.heading || section.eyebrow || ""}
                    className="object-cover"
                    sizes="(min-width:768px) 50vw,100vw"
                    quality={95}
                  />
                </div>
              )}
              <div
                className={`home-split-content px-6 sm:px-12 xl:px-24 py-8 lg:py-0 ${!section.image ? "md:col-span-2 mx-auto max-w-4xl text-center" : ""}`}
              >
                <div className="home-split-innerbox">
                  {(section.eyebrow || section.heading) && (
                    <h2 className="title text-[22px] uppercase text-[var(--accent)] sm:text-[24px] lg:text-[30px]">
                      {section.eyebrow || section.heading}
                    </h2>
                  )}
                  {section.body && (
                    <p className="mt-5 whitespace-pre-line text-[11px] leading-6">
                      {section.body}
                    </p>
                  )}
                  <Button className="custom-button" label={section.buttonLabel} href={section.buttonHref} />
                </div>
              </div>
            </section>
          );
        }
        return null;
      })}
    </main>
  );
}
