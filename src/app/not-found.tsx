import Link from "next/link";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { STOREFRONT_CONTENT_QUERY } from "@/sanity/lib/queries";
import styles from "./status-pages.module.css";

type NotFoundContent = { notFoundPage?: { eyebrow?: string; heading?: string; message?: string; homeLabel?: string; shopLabel?: string } } | null;

export default async function NotFound() {
  const data = isSanityConfigured ? await sanityFetch<NotFoundContent>(STOREFRONT_CONTENT_QUERY, {}, ["sanity", "storefront-content"]) : null;
  const copy = {
    eyebrow: "Page not found", heading: "This page is unavailable",
    message: "The page may have moved or no longer exists.", homeLabel: "Return home", shopLabel: "Shop silks",
    ...data?.notFoundPage,
  };
  return (
    <main className={styles.page}>
      <section className={styles.inner}>
        <span className={styles.code} aria-hidden="true">404</span>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1 className={styles.title}>{copy.heading}</h1>
        <p className={styles.copy}>{copy.message}</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">{copy.homeLabel}</Link>
          <Link className={styles.secondary} href="/collections/shop">{copy.shopLabel}</Link>
        </div>
      </section>
    </main>
  );
}
