import type { Metadata, Viewport } from "next";
import { cache, Suspense } from "react";
import Image from "next/image";
import Script from "next/script";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import "./custom.css";
import "./responsive.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GlobalLoader } from "@/components/global-loader";
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

type Settings = {
  title?: string;
  description?: string;
  titleTemplate?: string;
  favicon?: SanityImageSource;
  socialImage?: SanityImageSource & { alt?: string };
  keywords?: string[];
  locale?: string;
  themeColor?: string;
  allowIndex?: boolean;
  allowFollow?: boolean;
  theme?: {
    headingFont?: string;
    bodyFont?: string;
    background?: string;
    foreground?: string;
    accent?: string;
    surface?: string;
    pdpText?: string;
    white?: string;
    black?: string;
    bodyFontSize?: number;
    buttonFontSize?: number;
    bodyLineHeight?: number;
    commonHeadingSize?: string;
  };
} | null;

const getDefaultSettings = cache(async () =>
  isSanityConfigured ? sanityFetch<Settings>(SITE_SETTINGS_QUERY) : null,
);

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getDefaultSettings();
  const siteTitle = settings?.title || "Ivory Muse";
  const description =
    settings?.description || "Ivory Muse headless Shopify storefront.";
  const favicon = settings?.favicon
    ? sanityImageUrl(settings.favicon, 512)
    : undefined;
  const socialImage = settings?.socialImage
    ? sanityImageUrl(settings.socialImage, 1200)
    : undefined;

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    applicationName: siteTitle,
    title: {
      default: siteTitle,
      template: settings?.titleTemplate || `%s | ${siteTitle}`,
    },
    description,
    keywords: settings?.keywords,
    icons: favicon
      ? { icon: favicon, shortcut: favicon, apple: favicon }
      : undefined,
    robots: {
      index: settings?.allowIndex !== false,
      follow: settings?.allowFollow !== false,
    },
    openGraph: {
      type: "website",
      siteName: siteTitle,
      title: siteTitle,
      description,
      locale: settings?.locale || "en_AU",
      images: socialImage
        ? [{ url: socialImage, alt: settings?.socialImage?.alt || siteTitle }]
        : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title: siteTitle,
      description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getDefaultSettings();
  return {
    colorScheme: "light",
    themeColor:
      settings?.themeColor || settings?.theme?.background || "#FFF9F3",
  };
}
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
  const [settings, header, footer] = await Promise.all([
    isSanityConfigured ? getDefaultSettings() : null,
    isSanityConfigured ? sanityFetch<HeaderData>(HEADER_SETTINGS_QUERY) : null,
    isSanityConfigured ? sanityFetch<FooterData>(FOOTER_SETTINGS_QUERY) : null,
  ]);
  const headerLogoUrl = header?.logo
    ? sanityImageUrl(header.logo, 640)
    : undefined;
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
      className={`${bodyFont.variable} ${headingFont.variable} site-loading h-full antialiased`}
      style={
        {
          "--background": settings?.theme?.background || "#FFF9F3",
          "--foreground": settings?.theme?.foreground || "#333333",
          "--accent": settings?.theme?.accent || "#9B504A",
          "--surface": settings?.theme?.surface || "#FFF5EA",
          "--theme-red": settings?.theme?.accent || "#9B504A",
          "--primary-color": settings?.theme?.foreground || "#333333",
          "--body-bg-color": settings?.theme?.background || "#FFF9F3",
          "--pdp-text": settings?.theme?.pdpText || "#706E6E",
          "--white": settings?.theme?.white || "#FFFFFF",
          "--black": settings?.theme?.black || "#000000",
          "--body-font-size": `${settings?.theme?.bodyFontSize || 18}px`,
          "--button-font-size": `${settings?.theme?.buttonFontSize || 16}px`,
          "--common-heading":
            settings?.theme?.commonHeadingSize || "clamp(2.6rem, 2vw, 3rem)",
          "--primary-font":
            settings?.theme?.bodyFont || "Arial, Helvetica, sans-serif",
          "--secondary-font":
            settings?.theme?.headingFont || '"Times New Roman", Times, serif',
          "--body-line-height": settings?.theme?.bodyLineHeight || 1.5,
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
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
      >
        {process.env.NODE_ENV === "development" && (
          <Script
            id="development-extension-cleanup"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: extensionCleanup }}
          />
        )}
        <Suspense
          fallback={
            <div
              className="global-loader global-loader--visible"
              aria-label="Loading Ivory Muse"
              role="status"
            >
              <div className="global-loader__mark" aria-hidden="true">
                {headerLogoUrl ? (
                  <Image
                    src={headerLogoUrl}
                    alt=""
                    width={240}
                    height={220}
                    quality={95}
                    sizes="120px"
                    className="global-loader__logo"
                    priority
                  />
                ) : (
                  header?.title?.trim().charAt(0) || "M"
                )}
              </div>
              <div className="global-loader__line" aria-hidden="true">
                <span />
              </div>
            </div>
          }
        >
          <GlobalLoader logoUrl={headerLogoUrl} title={header?.title} />
        </Suspense>
        <Header
          title={header?.title}
          logoUrl={headerLogoUrl}
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
