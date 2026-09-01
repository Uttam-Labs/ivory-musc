import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { isSanityConfigured } from "@/lib/env";
import { normalizeShopHref } from "@/lib/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { ABOUT_PAGE_QUERY } from "@/sanity/lib/queries";

type ImageData = SanityImageSource & { alt?: string };
type Item = {
  _key?: string;
  icon?: ImageData;
  image?: ImageData;
  title?: string;
  body?: string;
  linkLabel?: string;
  linkHref?: string;
};
type Section = Item & {
  _type: string;
  heading?: string;
  sectionName?: string;
  imagePosition?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  items?: Item[];
  cards?: Item[];
};
type Content = { sections?: Section[] } | null;

function Paragraphs({
  text,
  afterParagraph,
  afterIndex = 1,
}: {
  text?: string;
  afterParagraph?: ReactNode;
  afterIndex?: number;
}) {
  if (!text) return null;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <div key={i}>
          <p>{p.replace(/\s*\n\s*/g, " ")}</p>
          {i === Math.min(afterIndex, paragraphs.length - 1) ? afterParagraph : null}
        </div>
      ))}
    </div>
  );
}
function Button({
  label,
  href,
  filled = false,
  className = "",
}: {
  label?: string;
  href?: string;
  filled?: boolean;
  className?: string;
}) {
  if (!label || !href) return null;
  return (
    <Link
      href={normalizeShopHref(label, href)}
      className={`inline-flex h-[38px] items-center justify-center border px-6 text-[10px] uppercase tracking-[.1em] transition ${filled ? "border-white bg-white text-stone-800 hover:bg-transparent hover:text-white" : "border-white text-white hover:bg-white hover:text-stone-800"} ${className}`}
    >
      {label}
    </Link>
  );
}

export default async function AboutPage() {
  const page = isSanityConfigured
    ? await sanityFetch<Content>(ABOUT_PAGE_QUERY)
    : null;
  if (!page) return null;
  const sections = page.sections || [];
  const hero = sections.find((section) => section._type === "aboutHero");
  const editorials = sections.filter(
    (section) => section._type === "aboutEditorial",
  );
  const why =
    editorials.find((section) => section._key === "why") || editorials[0];
  const nature =
    editorials.find((section) => section._key === "nature") || editorials[1];
  const grids = sections.filter(
    (section) => section._type === "aboutFeatureGrid",
  );
  const values =
    grids.find((section) => section._key === "values")?.items ||
    grids[0]?.items;
  const vision = sections.find((section) => section._type === "aboutVision");
  return (
    <main className="about-page flex-1 overflow-hidden bg-[#fff9f3] text-[#333]">
      {hero && (
        <section className="about-hero relative flex min-h-[600px] items-end text-white md:min-h-[450px] xl:min-h-[652px]">
          {hero.image && (
            <Image
              fill
              priority
              src={sanityImageUrl(hero.image, 3840)}
              alt={hero.image.alt || hero.heading || ""}
              className="object-cover"
              sizes="100vw"
              quality={95}
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="home-hero-content about-hero-content relative mx-auto w-full max-w-[1920] px-6 sm:px-12 xl:px-24 pb-16 md:pb-20 lg:pb-36">
            <div className="home-hero__content-wrap about-hero__content-wrap w-full md:w-4/5 xl:w-1/2">
              <h1 className="hero-title max-w-[640px] font-heading text-[34px] uppercase leading-tight lg:text-[40px]">
                {hero.heading}
              </h1>
              <p className="mt-4 w-full max-w-[700px] text-[11px] leading-5 lg:text-xs">
                {hero.body}
              </p>
              <div className="home-hero__buttons mt-7 flex flex-wrap gap-5">
                <Button
                  filled
                  label={hero.primaryLabel}
                  href={hero.primaryHref}
                  className="button custom-button btn-white"
                />
                <Button
                  label={hero.secondaryLabel}
                  href={hero.secondaryHref}
                  className="about-hero-secondary-cta button custom-button btn-transparent"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {why && (
        <section className="home-split about-image-split about-first-editorial mx-auto grid max-w-[1920] px-6 sm:px-12 xl:px-24 items-start gap-0 py-20 lg:grid-cols-2 lg:gap-0 lg:py-36">
          {why.image && (
            <div className="home-split-image about-why__desktop-image relative aspect-[1.88/1] w-full">
              <Image
                fill
                src={sanityImageUrl(why.image, 3200)}
                alt={why.image.alt || why.heading || ""}
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 50vw"
                quality={95}
              />
            </div>
          )}
          <div className="home-split-content pl-0 lg:pl-8 pt-8 lg:pt-0">
            <div className="home-split-innerbox">
              <h2 className="title text-[24px] uppercase text-[var(--accent)] lg:text-[30px]">
                {why.heading}
              </h2>
              <Paragraphs
                text={why.body}
                afterParagraph={why.image ? (
                  <div className="about-why__mobile-image relative aspect-[1.88/1] w-full">
                    <Image
                      fill
                      src={sanityImageUrl(why.image, 1600)}
                      alt={why.image.alt || why.heading || ""}
                      className="object-cover"
                      sizes="calc(100vw - 4.4rem)"
                      quality={95}
                    />
                  </div>
                ) : null}
              />
            </div>
          </div>
        </section>
      )}

      {values?.length ? (
        <section className="about-icon-texts mx-auto grid max-w-[1920] px-6 sm:px-12 xl:px-24 gap-12 sm:gap-8 lg:gap-36 pb-24 text-center sm:grid-cols-4 lg:grid-cols-4">
          {values.map((item, i) => (
            <article key={item._key || i}>
              {item.icon && (
                <div className="relative mx-auto size-[35px] xl:size-[50px]">
                  <Image
                    fill
                    src={sanityImageUrl(item.icon, 160)}
                    alt={item.icon.alt || ""}
                    className="object-contain"
                  />
                </div>
              )}
              <h3 className="mt-5 abt-icon__title text-[var(--accent)]">
                {item.title}
              </h3>
              <p className="mx-auto mt-4 abt-icon__texts">
                {item.body}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {nature && (
        <section className="about-image__icontext mx-auto grid max-w-[1920px] px-6 sm:px-12 xl:px-24 items-start gap-12 lg:gap-8 pt-0 pb-16 lg:grid-cols-[1.22fr_1fr] lg:gap-12 lg:py-20">
          <div className="">
            <h2 className="font-heading common-heading text-[22px] uppercase text-[var(--accent)] lg:text-[24px]">
              {nature.heading}
            </h2>
            <div className="mt-6 w-full lg:max-w-[680px]">
              <Paragraphs text={nature.body} />
            </div>
            {nature.items?.length ? (
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-8 xl:gap-x-12 gap-y-8 lg:grid-cols-4">
                {nature.items.map((item, i) => (
                  <article key={item._key || i} className="text-center">
                    {item.icon && (
                      <div className="relative mx-auto size-[35px] xl:size-[50px]">
                        <Image
                          fill
                          src={sanityImageUrl(item.icon, 160)}
                          alt={item.icon.alt || ""}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <h3 className="mt-5 abt-icon__title text-[var(--accent)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 abt-icon__texts">{item.body}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
          {nature.image && (
            <div className="relative aspect-[1.43/1] w-full -order-1 lg:order-1">
              <Image
                fill
                src={sanityImageUrl(nature.image, 3200)}
                alt={nature.image.alt || nature.heading || ""}
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 55vw"
                quality={95}
              />
            </div>
          )}
        </section>
      )}

      {vision && (
        <section className="relative pt-10 pb-10 text-center lg:pt-28">
          <div className="relative mx-auto max-w-[900px] px-6 lg:px-8">
            <h2 className="font-heading common-heading uppercase text-[var(--accent)]">
              {vision.heading}
            </h2>
            <div className="mt-6">
              <Paragraphs text={vision.body} />
            </div>
          </div>
          {vision.cards?.length ? (
            <div className="relative mx-auto mt-14 grid max-w-[1920] px-6 sm:px-12 xl:px-24 gap-8 xl:gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {vision.cards.map((card, i) => (
                <article
                  key={card._key || i}
                  className="vision-card__item flex h-full flex-col border border-[#ded5ce] bg-[#fff9f3] text-left"
                >
                  {card.image && (
                    <div className="relative aspect-[1.09]">
                      <Image
                        fill
                        src={sanityImageUrl(card.image, 1800)}
                        alt={card.image.alt || card.title || ""}
                        className="object-cover"
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                        quality={95}
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col px-7 py-7">
                    <h3 className="font-heading abt-icon__title text-xl text-[var(--accent)]">
                      {card.title}
                    </h3>
                    <p className="vscard-text">{card.body}</p>
                    {card.linkLabel && card.linkHref && (
                      <Link
                        href={normalizeShopHref(card.linkLabel, card.linkHref)}
                        className="explore--link mt-auto self-start uppercase text-[var(--accent)] underline decoration-[var(--accent)] decoration-[1px] underline-offset-[3px]"
                      >
                        {card.linkLabel}
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
