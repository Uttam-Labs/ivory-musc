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
  const [visible, setVisible] = useState(true);
  const firstRender = useRef(true);

  useEffect(() => {
    const delay = firstRender.current ? 700 : 450;
    firstRender.current = false;
    const timer = window.setTimeout(() => setVisible(false), delay);
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

      setVisible(true);
      window.setTimeout(() => setVisible(false), 2500);
    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => document.removeEventListener("click", showBeforeNavigation, true);
  }, []);

  return (
    <div
      className={`global-loader ${visible ? "global-loader--visible" : ""}`}
      aria-hidden={!visible}
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
  );
}
