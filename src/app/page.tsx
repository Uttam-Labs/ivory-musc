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
}: {
  label?: string;
  href?: string;
  light?: boolean;
  variant?: "primary" | "secondary" | "solid";
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
      className={`mt-6 inline-flex h-[38px] items-center justify-center border px-7 text-center text-[10px] font-medium uppercase tracking-[.12em] transition-all duration-300 ${buttonStyle}`}
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
                  src={sanityImageUrl(section.image, 2200)}
                  alt={section.heading || ""}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              )}
              <div className="absolute inset-0 bg-black/15" />
              <div className="relative mx-auto w-full max-w-[1440px] px-6 pb-16 md:pb-20 lg:px-8">
                {section.heading && (
                  <h1 className="max-w-full text-[25px] uppercase leading-tight sm:text-[28px] lg:whitespace-nowrap">
                    {section.heading}
                  </h1>
                )}
                {section.body && (
                  <p className="mt-3 max-w-[620px] whitespace-pre-line text-[11px] leading-5 sm:text-xs">
                    {section.body}
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button
                    label={section.buttonLabel}
                    href={section.buttonHref}
                    light
                  />
                  <Button
                    label={section.secondaryButtonLabel}
                    href={section.secondaryButtonHref}
                    light
                    variant="secondary"
                  />
                </div>
              </div>
            </section>
          );
        if (section._type === "collectionSlider") {
          if (!products.length) return null;
          return (
            <section
              key={key}
              className="home-bestseller mx-auto max-w-[1440px] bg-[#fff9f3] px-5 py-16 sm:px-7 lg:px-12 lg:py-24"
            >
              {(section.heading || section.intro) && (
                <header className="mb-10 text-center">
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
                autoSlide={section.autoSlide}
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
              className="home-story mx-auto max-w-[1180px] bg-[#fff9f3] px-6 py-16 text-center sm:px-8 lg:py-24"
            >
              {section.heading && (
                <h2 className="text-[22px] uppercase text-[var(--accent)]">
                  {section.heading}
                </h2>
              )}
              {storyParagraphs?.length ? (
                <div className="mt-4 space-y-3 text-[11px] leading-5">
                  {storyParagraphs.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              <Button label={section.buttonLabel} href={section.buttonHref} />
            </section>
          );
        }
        if (section._type === "featureGuide")
          return (
            <section
              key={key}
              className="home-guide mx-auto max-w-[1440px] bg-[#fff9f3] px-5 py-16 text-center sm:px-6 lg:py-24"
            >
              {section.heading && (
                <h2 className="text-[22px] uppercase text-[var(--accent)]">
                  {section.heading}
                </h2>
              )}
              {section.body && (
                <p className="mx-auto mt-4 max-w-3xl whitespace-pre-line text-xs leading-6">
                  {section.body}
                </p>
              )}
              <Button
                label={section.buttonLabel}
                href={section.buttonHref}
                variant="solid"
              />
              {section.features?.length ? (
                <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                  {section.features.map((feature, i) => (
                    <div key={feature.title || i}>
                      {feature.icon && (
                        <div className="relative mx-auto size-12">
                          <Image
                            fill
                            src={sanityImageUrl(feature.icon, 120)}
                            alt=""
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                      )}
                      {feature.title && (
                        <p className="mt-4 text-[10px] text-[var(--accent)]">
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
              className="home-newsletter grid bg-[#fff9f3] md:min-h-[430px] md:grid-cols-[45%_55%]"
            >
              <div className="flex flex-col items-center justify-center bg-[#fff5ea] px-6 py-14 text-center sm:px-8 md:py-16 lg:px-14">
                {section.heading && (
                  <h2 className="text-[22px] uppercase text-[var(--accent)]">
                    {section.heading}
                  </h2>
                )}
                {section.body && (
                  <p className="mt-4 max-w-md whitespace-pre-line text-xs leading-6">
                    {section.body}
                  </p>
                )}
                <NewsletterForm
                  placeholder={section.emailPlaceholder}
                  submitLabel={section.submitLabel}
                />
              </div>
              {section.image && (
                <div className="relative min-h-[280px] sm:min-h-80">
                  <Image
                    fill
                    src={sanityImageUrl(section.image)}
                    alt={section.heading || ""}
                    className="object-cover"
                    sizes="(min-width: 768px) 55vw, 100vw"
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
                    src={sanityImageUrl(section.image, 2000)}
                    alt={section.heading || ""}
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                )}
                <div className="absolute inset-0 bg-black/15" />
                <div className="relative flex w-full flex-col items-center px-8 text-center md:w-1/2 lg:px-14">
                  {section.heading && (
                    <h2 className="max-w-[620px] text-[24px] uppercase leading-[1.2] lg:text-[27px]">
                      {section.heading}
                    </h2>
                  )}
                  {section.body && (
                    <p className="mx-auto mt-4 max-w-lg text-[11px] leading-5">
                      {section.body}
                    </p>
                  )}
                  <Button
                    label={section.buttonLabel}
                    href={section.buttonHref}
                    light
                  />
                </div>
              </section>
            );
          const reverse = section.imagePosition === "right";
          const isChosen = section._key === "chosen";
          return (
            <section
              key={key}
              className={`home-split mx-auto grid max-w-[1440px] items-start bg-[#fff9f3] md:grid-cols-2 ${isChosen ? "home-chosen pt-20 sm:pt-24 lg:pt-36" : "home-philosophy"}`}
            >
              {section.image && (
                <div
                  className={`relative aspect-[1.65/1] w-full ${reverse ? "md:order-2" : ""}`}
                >
                  <Image
                    fill
                    src={sanityImageUrl(section.image)}
                    alt={section.heading || section.eyebrow || ""}
                    className="object-cover"
                    sizes="(min-width:768px) 50vw,100vw"
                  />
                </div>
              )}
              <div
                className={`px-6 pb-14 pt-8 sm:px-8 md:pb-10 lg:px-12 lg:pt-3 ${!section.image ? "md:col-span-2 mx-auto max-w-4xl text-center" : ""}`}
              >
                {(section.eyebrow || section.heading) && (
                  <h2 className="text-[22px] uppercase text-[var(--accent)] sm:text-[24px] lg:text-[30px]">
                    {section.eyebrow || section.heading}
                  </h2>
                )}
                {section.body && (
                  <p className="mt-5 whitespace-pre-line text-[11px] leading-6">
                    {section.body}
                  </p>
                )}
                <Button label={section.buttonLabel} href={section.buttonHref} />
              </div>
            </section>
          );
        }
        return null;
      })}
    </main>
  );
}
