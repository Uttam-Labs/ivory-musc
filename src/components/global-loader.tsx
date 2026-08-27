"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export function GlobalLoader({
  logoUrl,
  title = "Ivory Muse",
}: {
  logoUrl?: string;
  title?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const previousPathname = useRef(pathname);
  const navigationStartedAt = useRef(0);
  const navigationMaximumTimer = useRef<number | null>(null);

  useEffect(() => {
    let minimumTimePassed = false;
    let pageLoaded = document.readyState === "complete";
    const finishWhenReady = () => {
      if (minimumTimePassed && pageLoaded) setInitialLoading(false);
    };
    const minimumTimer = window.setTimeout(() => {
      minimumTimePassed = true;
      pageLoaded = pageLoaded || document.readyState === "complete";
      finishWhenReady();
    }, 650);
    const maximumTimer = window.setTimeout(() => setInitialLoading(false), 3000);
    const handleLoad = () => {
      pageLoaded = true;
      finishWhenReady();
    };

    if (!pageLoaded) window.addEventListener("load", handleLoad, { once: true });
    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(maximumTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    if (initialLoading) return;
    document.documentElement.classList.remove("site-loading");
  }, [initialLoading]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    const elapsed = performance.now() - navigationStartedAt.current;
    const timer = window.setTimeout(
      () => {
        setNavigating(false);
        if (navigationMaximumTimer.current) {
          window.clearTimeout(navigationMaximumTimer.current);
          navigationMaximumTimer.current = null;
        }
      },
      Math.max(0, 450 - elapsed),
    );
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const showBeforeNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const target = event.target as Element | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search) ||
        destination.protocol === "mailto:" ||
        destination.protocol === "tel:"
      ) return;

      event.preventDefault();
      navigationStartedAt.current = performance.now();
      flushSync(() => setNavigating(true));
      if (navigationMaximumTimer.current) {
        window.clearTimeout(navigationMaximumTimer.current);
      }
      navigationMaximumTimer.current = window.setTimeout(
        () => setNavigating(false),
        3000,
      );

      const href = `${destination.pathname}${destination.search}${destination.hash}`;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => router.push(href));
      });
    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => {
      document.removeEventListener("click", showBeforeNavigation, true);
      if (navigationMaximumTimer.current) {
        window.clearTimeout(navigationMaximumTimer.current);
      }
    };
  }, [router]);

  return (
      <div
        className={`global-loader ${initialLoading || navigating ? "global-loader--visible" : ""}`}
        aria-hidden={!(initialLoading || navigating)}
        aria-label="Loading Ivory Muse"
        role="status"
      >
        <div className="global-loader__mark" aria-hidden="true">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={240}
              height={220}
              quality={95}
              sizes="120px"
              className="global-loader__logo"
              priority
            />
          ) : (
            title.trim().charAt(0) || "M"
          )}
        </div>
        <div className="global-loader__line" aria-hidden="true"><span /></div>
      </div>
  );
}
