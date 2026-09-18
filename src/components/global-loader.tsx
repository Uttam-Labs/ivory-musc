"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

const INITIAL_LOADER_TIME = 550;
const NAVIGATION_LOADER_TIME = 350;

export function GlobalLoader({
  logoUrl,
  title = "Ivory Muse",
}: {
  logoUrl?: string;
  title?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [initialLoading, setInitialLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const previousRoute = useRef(routeKey);
  const previousPathname = useRef(pathname);
  const navigationStartedAt = useRef(0);
  const navigationMaximumTimer = useRef<number | null>(null);
  const navigationDestination = useRef("");

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
    }, INITIAL_LOADER_TIME);
    const maximumTimer = window.setTimeout(() => setInitialLoading(false), 1000);
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
    if (previousRoute.current === routeKey) return;
    previousRoute.current = routeKey;
    navigationDestination.current = "";
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    const elapsed = performance.now() - navigationStartedAt.current;
    const timer = window.setTimeout(
      () => {
        setNavigating(false);
        if (navigationMaximumTimer.current) {
          window.clearTimeout(navigationMaximumTimer.current);
          navigationMaximumTimer.current = null;
        }
      },
      Math.max(0, NAVIGATION_LOADER_TIME - elapsed),
    );
    return () => window.clearTimeout(timer);
  }, [pathname, routeKey]);

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

      navigationStartedAt.current = performance.now();
      navigationDestination.current = `${destination.pathname}${destination.search}`;
      setNavigating(true);
      if (navigationMaximumTimer.current) {
        window.clearTimeout(navigationMaximumTimer.current);
      }
      navigationMaximumTimer.current = window.setTimeout(
        () => {
          setNavigating(false);
          const expected = navigationDestination.current;
          const current = `${window.location.pathname}${window.location.search}`;
          if (expected && current !== expected) window.location.assign(expected);
        },
        8000,
      );

    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => {
      document.removeEventListener("click", showBeforeNavigation, true);
      if (navigationMaximumTimer.current) {
        window.clearTimeout(navigationMaximumTimer.current);
      }
    };
  }, []);

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
