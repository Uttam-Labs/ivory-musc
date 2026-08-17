import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import "./custom.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { env } from "@/lib/env";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import {
  FOOTER_SETTINGS_QUERY,
  HEADER_SETTINGS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import { sanityImageUrl } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";

const bodyFont = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
});
const headingFont = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Ivory Muse", template: "%s | Ivory Muse" },
  description: "Ivory Muse headless Shopify storefront.",
};

type Settings = {
  theme?: {
    headingFont?: string;
    bodyFont?: string;
    background?: string;
    foreground?: string;
    accent?: string;
    surface?: string;
  };
} | null;
type HeaderData = {
  title?: string;
  logo?: SanityImageSource;
  logoSizeDesktop?: number;
  logoSizeMobile?: number;
  navigation?: Array<{ label?: string; href?: string }>;
  showSearch?: boolean;
  searchHref?: string;
  showAccount?: boolean;
  accountHref?: string;
  showCart?: boolean;
  cartHref?: string;
} | null;
type FooterData = {
  contactHeading?: string;
  contactEmail?: string;
  socialHeading?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  footerColumns?: Array<{
    heading?: string;
    links?: Array<{ label?: string; href?: string }>;
  }>;
  copyright?: string;
} | null;
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, header, footer] = isSanityConfigured
    ? await Promise.all([
        sanityFetch<Settings>(SITE_SETTINGS_QUERY),
        sanityFetch<HeaderData>(HEADER_SETTINGS_QUERY),
        sanityFetch<FooterData>(FOOTER_SETTINGS_QUERY),
      ])
    : [null, null, null];
  const extensionCleanup = `
    (() => {
      const injected = /^(bis_|processed_)/;
      const clean = (root) => {
        if (!(root instanceof Element)) return;
        for (const name of root.getAttributeNames()) {
          if (injected.test(name)) root.removeAttribute(name);
        }
        root.querySelectorAll('*').forEach((element) => {
          for (const name of element.getAttributeNames()) {
            if (injected.test(name)) element.removeAttribute(name);
          }
        });
      };
      clean(document.documentElement);
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          if (record.type === 'attributes' && injected.test(record.attributeName || '')) {
            record.target.removeAttribute(record.attributeName);
          }
          record.addedNodes.forEach(clean);
        }
      });
      observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
      window.addEventListener('load', () => setTimeout(() => observer.disconnect(), 1500), { once: true });
    })();
  `;

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
      style={
        {
          "--background": settings?.theme?.background || "#ffffff",
          "--foreground": settings?.theme?.foreground || "#000000",
          "--accent": settings?.theme?.accent || "#000000",
          "--surface": settings?.theme?.surface || "#ffffff",
          "--cms-heading-font":
            settings?.theme?.headingFont === "Cormorant Garamond"
              ? "var(--font-heading)"
              : settings?.theme?.headingFont || "var(--font-heading)",
          "--cms-body-font":
            settings?.theme?.bodyFont === "Montserrat"
              ? "var(--font-body)"
              : settings?.theme?.bodyFont || "var(--font-body)",
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <script dangerouslySetInnerHTML={{ __html: extensionCleanup }} />
        )}
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
      >
        <Header
          title={header?.title}
          logoUrl={header?.logo ? sanityImageUrl(header.logo, 320) : undefined}
          logoSizeDesktop={header?.logoSizeDesktop}
          logoSizeMobile={header?.logoSizeMobile}
          navigation={header?.navigation}
          showSearch={header?.showSearch}
          searchHref={header?.searchHref}
          showAccount={header?.showAccount}
          accountHref={header?.accountHref}
          showCart={header?.showCart}
          cartHref={header?.cartHref}
        />
        {children}
        <Footer
          contactHeading={footer?.contactHeading}
          email={footer?.contactEmail}
          socialHeading={footer?.socialHeading}
          instagram={footer?.instagramUrl}
          facebook={footer?.facebookUrl}
          columns={footer?.footerColumns}
          copyright={footer?.copyright}
        />
      </body>
    </html>
  );
}
