"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { Product } from "@/lib/shopify/types";

function metafieldText(metafield?: Product["featuredDescription"]) {
  if (!metafield?.value) return "";
  if (metafield.type !== "rich_text_field") return metafield.value;
  try {
    const root = JSON.parse(metafield.value) as {
      children?: Array<{ children?: Array<{ value?: string }> }>;
    };
    return root.children
      ?.flatMap((paragraph) => paragraph.children?.map((child) => child.value || "") || [])
      .join(" ")
      .trim() || "";
  } catch {
    return "";
  }
}
export function CollectionSlider({
  products,
  autoSlide = false,
  slideInterval = 5000,
}: {
  products: Product[];
  autoSlide?: boolean;
  slideInterval?: number;
}) {
  const plugins = autoSlide
    ? [
        Autoplay({
          delay: slideInterval,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]
    : [];
  const [ref, api] = useEmblaCarousel(
    { loop: products.length > 3, align: "start" },
    plugins,
  );
  return (
    <div className="relative">
      <div ref={ref} className="overflow-hidden">
        <div className="-ml-8 flex">
          {products.map((p) => (
            <article
              key={p.id}
              className="min-w-0 flex-[0_0_88%] pl-8 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <Link
                href={`/products/${p.handle}`}
                className="block text-center"
              >
                <div className="bg-[var(--surface)] p-7 lg:p-8">
                  <div className="relative aspect-[.79] overflow-hidden">
                    {p.featuredImage && (
                      <Image
                        fill
                        src={p.featuredImage.url}
                        alt={p.featuredImage.altText || p.title}
                        className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                        sizes="(min-width:1024px) 29vw,84vw"
                      />
                    )}
                  </div>
                </div>
                <h3 className="mt-5 font-heading text-lg text-[var(--accent)]">
                  {p.title}
                </h3>
              {metafieldText(p.featuredDescription) && (
                <p className="mx-auto mt-2 line-clamp-2 max-w-sm text-[10px] leading-4">
                  {metafieldText(p.featuredDescription)}
                </p>
              )}
                <span className="mt-3 inline-block text-[9px] text-[var(--accent)] underline decoration-[var(--accent)] decoration-[1px] underline-offset-[3px] transition-opacity duration-300 group-hover:opacity-65">
                  Explore {p.title}
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
      {products.length > 1 && (
        <>
          <button
            aria-label="Previous product"
            onClick={() => api?.scrollPrev()}
            className="absolute left-0 top-[42%] flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--accent)] text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next product"
            onClick={() => api?.scrollNext()}
            className="absolute right-0 top-[42%] flex size-10 translate-x-1/2 items-center justify-center rounded-full bg-[var(--accent)] text-white"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
}
