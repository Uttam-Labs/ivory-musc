"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HOME_REVEAL_SELECTOR = [
  ".section__heading > *",
  ".home-split-image",
  ".home-split-innerbox > *",
  ".home-bestseller article",
  ".text-icons > *",
  ".newsletter-wrapper > *",
  ".home-newsletter > div:last-child",
  ".home-campaign-text > div > *",
].join(",");

const PAGE_REVEAL_SELECTOR = [
  "main:not(.home-page) h1",
  "main:not(.home-page) > section",
  "main:not(.home-page) article",
  "main:not(.home-page) form",
  "main:not(.home-page) [class*='card']",
  "main:not(.home-page) [class*='Card']",
].join(",");

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    const selector = main.classList.contains("home-page")
      ? HOME_REVEAL_SELECTOR
      : PAGE_REVEAL_SELECTOR;
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    );
    const candidateSet = new Set(candidates);
    const elements = candidates.filter((element) => {
      let parent = element.parentElement;
      while (parent && parent !== main) {
        if (candidateSet.has(parent)) return false;
        parent = parent.parentElement;
      }
      return true;
    });

    document.documentElement.classList.add("scroll-reveal-enabled");
    elements.forEach((element, index) => {
      element.dataset.scrollReveal = "";
      element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("scroll-reveal-enabled");
      elements.forEach((element) => {
        delete element.dataset.scrollReveal;
        element.classList.remove("is-revealed");
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, [pathname]);

  return null;
}
