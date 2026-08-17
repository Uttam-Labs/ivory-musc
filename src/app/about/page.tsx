import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";
import { isSanityConfigured } from "@/lib/env";
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

function Paragraphs({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="space-y-4 text-[11px] leading-5">
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p.replace(/\s*\n\s*/g, " ")}</p>
        ))}
    </div>
  );
}
function Button({
  label,
  href,
  filled = false,
}: {
  label?: string;
  href?: string;
  filled?: boolean;
}) {
  if (!label || !href) return null;
  return (
    <Link
      href={href}
      className={`inline-flex h-[38px] items-center justify-center border px-6 text-[10px] uppercase tracking-[.1em] transition ${filled ? "border-white bg-white text-stone-800 hover:bg-transparent hover:text-white" : "border-white text-white hover:bg-white hover:text-stone-800"}`}
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
        <section className="relative flex min-h-[600px] items-end text-white lg:min-h-[652px]">
          {hero.image && (
            <Image
              fill
              priority
              src={sanityImageUrl(hero.image, 2200)}
              alt={hero.image.alt || hero.heading || ""}
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative mx-auto w-full max-w-[1820px] px-7 pb-16 lg:px-12 lg:pb-24">
            <h1 className="max-w-[640px] font-heading text-[34px] uppercase leading-tight lg:text-[40px]">
              {hero.heading}
            </h1>
            <p className="mt-4 max-w-[660px] text-[11px] leading-5 lg:text-xs">
              {hero.body}
            </p>
            <div className="mt-7 flex flex-wrap gap-5">
              <Button
                filled
                label={hero.primaryLabel}
                href={hero.primaryHref}
              />
              <Button label={hero.secondaryLabel} href={hero.secondaryHref} />
            </div>
          </div>
        </section>
      )}

      {why && (
        <section className="mx-auto grid max-w-[1920px] items-start gap-8 px-6 py-20 md:grid-cols-2 lg:gap-7 lg:px-7 lg:py-24">
          {why.image && (
            <div className="relative aspect-[1.88/1] w-full">
              <Image
                fill
                src={sanityImageUrl(why.image, 1200)}
                alt={why.image.alt || why.heading || ""}
                className="object-cover"
                sizes="50vw"
              />
            </div>
          )}
          <div className="max-w-[690px] pt-1 md:pr-6 lg:pr-10">
            <h2 className="font-heading text-[24px] uppercase text-[var(--accent)] lg:text-[30px]">
              {why.heading}
            </h2>
            <div className="mt-5 max-w-[650px]">
              <Paragraphs text={why.body} />
            </div>
          </div>
        </section>
      )}

      {values?.length ? (
        <section className="mx-auto grid max-w-[1820px] gap-12 px-8 pb-24 text-center sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item, i) => (
            <article key={item._key || i}>
              {item.icon && (
                <div className="relative mx-auto size-[52px]">
                  <Image
                    fill
                    src={sanityImageUrl(item.icon, 120)}
                    alt={item.icon.alt || ""}
                    className="object-contain"
                  />
                </div>
              )}
              <h3 className="mt-5 font-heading text-lg text-[var(--accent)]">
                {item.title}
              </h3>
              <p className="mx-auto mt-4 max-w-[330px] text-[10px] leading-5">
                {item.body}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {nature && (
        <section className="mx-auto grid max-w-[1920px] items-start gap-8 px-6 py-16 md:grid-cols-2 lg:gap-7 lg:px-7 lg:py-20">
          <div className="md:pr-2 lg:pr-3">
            <h2 className="font-heading text-[22px] uppercase text-[var(--accent)] lg:text-[24px]">
              {nature.heading}
            </h2>
            <div className="mt-6 max-w-[680px]">
              <Paragraphs text={nature.body} />
            </div>
            {nature.items?.length ? (
              <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
                {nature.items.map((item, i) => (
                  <article key={item._key || i} className="text-center">
                    {item.icon && (
                      <div className="relative mx-auto size-[42px]">
                        <Image
                          fill
                          src={sanityImageUrl(item.icon, 100)}
                          alt={item.icon.alt || ""}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <h3 className="mt-4 font-heading text-xs text-[var(--accent)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[9px] leading-4">{item.body}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
          {nature.image && (
            <div className="relative aspect-[1.43/1] w-full">
              <Image
                fill
                src={sanityImageUrl(nature.image, 1300)}
                alt={nature.image.alt || nature.heading || ""}
                className="object-cover"
                sizes="50vw"
              />
            </div>
          )}
        </section>
      )}

      {vision && (
        <section className="relative py-20 text-center lg:py-28">
          <div className="relative mx-auto max-w-[900px] px-8">
            <h2 className="font-heading text-[24px] uppercase text-[var(--accent)] lg:text-[30px]">
              {vision.heading}
            </h2>
            <div className="mt-6">
              <Paragraphs text={vision.body} />
            </div>
          </div>
          {vision.cards?.length ? (
            <div className="relative mx-auto mt-14 grid max-w-[1820px] gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4">
              {vision.cards.map((card, i) => (
                <article
                  key={card._key || i}
                  className="flex h-full flex-col border border-[#ded5ce] bg-[#fff9f3] text-left"
                >
                  {card.image && (
                    <div className="relative aspect-[1.09]">
                      <Image
                        fill
                        src={sanityImageUrl(card.image, 900)}
                        alt={card.image.alt || card.title || ""}
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col px-7 py-7">
                    <h3 className="font-heading text-xl text-[var(--accent)]">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-[10px] leading-5">{card.body}</p>
                    {card.linkLabel && card.linkHref && (
                      <Link
                        href={card.linkHref}
                        className="mt-auto self-start pt-6 text-[10px] uppercase text-[var(--accent)] underline underline-offset-4"
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
