"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { Product } from "@/lib/shopify/types";

function metafieldText(metafield?: Product["specialTag"]) {
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
  autoSlide = true,
  slideInterval = 5000,
}: {
  products: Product[];
  autoSlide?: boolean;
  slideInterval?: number;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [arrowTop, setArrowTop] = useState<number>();
  const canLoop = products.length > 1;
  const loopProducts = canLoop && products.length < 8
    ? Array.from({ length: Math.ceil(8 / products.length) }, () => products).flat()
    : products;
  const autoplayPlugin = useMemo(
    () => autoSlide
      ? Autoplay({
        delay: slideInterval,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      })
      : null,
    [autoSlide, slideInterval],
  );
  const plugins = useMemo(
    () => autoplayPlugin ? [autoplayPlugin] : [],
    [autoplayPlugin],
  );
  const [ref, api] = useEmblaCarousel(
    { loop: canLoop, align: "start", slidesToScroll: 1 },
    plugins,
  );
  useEffect(() => {
    const slider = sliderRef.current;
    const media = slider?.querySelector<HTMLElement>(".bestseller-image-frame");
    if (!slider || !media) return;

    const alignArrows = () => setArrowTop(media.offsetTop + media.offsetHeight / 2);
    alignArrows();
    const observer = new ResizeObserver(alignArrows);
    observer.observe(slider);
    observer.observe(media);
    return () => observer.disconnect();
  }, [products.length]);
  useEffect(() => () => {
    if (autoplayResumeTimer.current) clearTimeout(autoplayResumeTimer.current);
  }, []);

  function scrollManually(direction: "previous" | "next") {
    autoplayPlugin?.stop();
    if (direction === "previous") api?.scrollPrev();
    else api?.scrollNext();
    if (autoplayResumeTimer.current) clearTimeout(autoplayResumeTimer.current);
    if (autoplayPlugin) {
      autoplayResumeTimer.current = setTimeout(() => autoplayPlugin.play(), 5000);
    }
  }
  return (
    <div ref={sliderRef} className="relative">
      <div ref={ref} className="overflow-hidden">
        <div className="bestseller-track -ml-3 flex sm:-ml-8">
          {loopProducts.map((p, index) => (
            <article
              key={`${p.id}-${index}`}
              className="bestseller-card min-w-0 flex-[0_0_50%] pl-3 sm:pl-8 lg:flex-[0_0_33.333%]"
            >
              <Link
                href={`/products/${p.handle}`}
                className="block text-center"
              >
                <div className="bestseller-image-frame bg-[white] p-3 sm:p-7 lg:p-8">
                  <div className="bestseller-card-media relative aspect-[.79] overflow-hidden">
                    {p.featuredImage && (
                      <Image
                        fill
                        src={p.featuredImage.url}
                        alt={p.featuredImage.altText || p.title}
                        className="object-cover"
                        sizes="(min-width:1024px) 29vw, (min-width:640px) 45vw, 44vw"
                        quality={95}
                      />
                    )}
                  </div>
                </div>
                <div className="bestseller-card-content pt-4 sm:pt-8">
                  <h3 className="mt-5 font-heading text-[var(--accent)]">
                    {p.title.toUpperCase()}
                  </h3>
                  {metafieldText(p.specialTag) && (
                    <p className="mx-auto mt-2 line-clamp-2 max-w-[374px] leading-4">
                      {metafieldText(p.specialTag)}
                    </p>
                  )}
                  <span className="explore--link inline-block text-[var(--accent)] underline decoration-[var(--accent)] decoration-[1px] underline-offset-[3px] transition-opacity duration-300 group-hover:opacity-65">
                    Explore {p.title.toUpperCase()}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
      {products.length > 1 && (
        <>
          <button
            aria-label="Previous product"
            onClick={() => scrollManually("previous")}
            style={arrowTop === undefined ? undefined : { top: arrowTop }}
            className="slider--button slider-button--prev cursor-pointer absolute left-8 lg:-left-12 top-[42%] flex size-14 lg:size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--accent)] text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next product"
            onClick={() => scrollManually("next")}
            style={arrowTop === undefined ? undefined : { top: arrowTop }}
            className="slider--button slider-button--next cursor-pointer absolute right-8 lg:-right-12 top-[42%] flex size-14 lg:size-20 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--accent)] text-white"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
}
