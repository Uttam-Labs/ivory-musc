"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  ".section__heading > *",
  ".home-split-image",
  ".home-split-innerbox > *",
  ".home-bestseller article",
  ".text-icons > *",
  ".newsletter-wrapper > *",
  ".home-newsletter > div:last-child",
  ".home-campaign-text > div > *",
].join(",");

export function ScrollReveal() {
  useEffect(() => {
    const home = document.querySelector<HTMLElement>(".home-page");
    if (!home) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    const elements = Array.from(
      home.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    );

    home.classList.add("scroll-reveal-enabled");
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
      home.classList.remove("scroll-reveal-enabled");
      elements.forEach((element) => {
        delete element.dataset.scrollReveal;
        element.classList.remove("is-revealed");
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, []);

  return null;
}
