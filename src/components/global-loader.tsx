"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function GlobalLoader({
  logoUrl,
  title = "Ivory Muse",
}: {
  logoUrl?: string;
  title?: string;
}) {
  const pathname = usePathname();
  const [initialLoading, setInitialLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const firstRender = useRef(true);
  const navigationStartedAt = useRef(0);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      const initialStartedAt = performance.now();
      let timer: number | undefined;
      const finishInitialLoad = () => {
        const remaining = Math.max(
          0,
          3000 - (performance.now() - initialStartedAt),
        );
        timer = window.setTimeout(() => setInitialLoading(false), remaining);
      };

      if (document.readyState === "complete") finishInitialLoad();
      else window.addEventListener("load", finishInitialLoad, { once: true });

      return () => {
        window.removeEventListener("load", finishInitialLoad);
        if (timer) window.clearTimeout(timer);
      };
    }

    const elapsed = performance.now() - navigationStartedAt.current;
    const timer = window.setTimeout(
      () => setNavigating(false),
      Math.max(0, 3000 - elapsed),
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

      navigationStartedAt.current = performance.now();
      setNavigating(true);
    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => {
      document.removeEventListener("click", showBeforeNavigation, true);
    };
  }, []);

  return (
    <>
      <div
        className={`global-loader ${initialLoading ? "global-loader--visible" : ""}`}
        aria-hidden={!initialLoading}
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
            />
          ) : (
            title.trim().charAt(0) || "M"
          )}
        </div>
        <div className="global-loader__line" aria-hidden="true"><span /></div>
      </div>
      <div
        className={`route-progress ${navigating ? "route-progress--visible" : ""}`}
        aria-hidden="true"
      ><span /></div>
    </>
  );
}
