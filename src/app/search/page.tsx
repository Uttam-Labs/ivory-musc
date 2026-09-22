import type { Metadata } from "next";
import { CollectionProductGrid, type ProductGridContent } from "@/components/collection-product-grid";
import { SearchIcon } from "@/components/header-icons";
import { SiteContainer } from "@/components/site-container";
import { getProducts } from "@/lib/shopify";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { COLLECTION_PAGE_QUERY, STOREFRONT_CONTENT_QUERY } from "@/sanity/lib/queries";
import styles from "./search.module.css";

type SearchCopy = {
  seoTitle?: string; eyebrow?: string; heading?: string; intro?: string; inputLabel?: string;
  placeholder?: string; submitLabel?: string; singleResultLabel?: string; multipleResultsLabel?: string;
  resultsForLabel?: string; resultsSuffix?: string; noResultsHeading?: string; noResultsText?: string; emptyHeading?: string; emptyText?: string;
};
type StorefrontContent = { searchPage?: SearchCopy } | null;
const fallback: Required<SearchCopy> = {
  seoTitle: "Search", eyebrow: "Discover Ivory Muse", heading: "Search our collection",
  intro: "Find silk fabrics by name, finish, colour or intended use.", inputLabel: "Search products",
  placeholder: "What are you looking for?", submitLabel: "Search", singleResultLabel: "result",
  multipleResultsLabel: "results", resultsForLabel: "for", resultsSuffix: "Explore the matching collection below",
  noResultsHeading: "No products found", noResultsText: "Try a different product name, colour or fabric type.",
  emptyHeading: "Find your perfect silk", emptyText: "Enter a search term to explore the Ivory Muse collection.",
};
async function getCopy() {
  const data = isSanityConfigured ? await sanityFetch<StorefrontContent>(STOREFRONT_CONTENT_QUERY, {}, ["sanity", "storefront-content"]) : null;
  return { ...fallback, ...data?.searchPage };
}
export async function generateMetadata(): Promise<Metadata> { const copy = await getCopy(); return { title: copy.seoTitle }; }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const copy = await getCopy();
  const collectionContent = isSanityConfigured
    ? await sanityFetch<{ productGridContent?: ProductGridContent } | null>(COLLECTION_PAGE_QUERY, {}, ["sanity", "collection-page"])
    : null;
  const term = typeof q === "string" ? q.trim() : "";
  const products = term ? await getProducts(24, term) : [];

  return (
    <main className={styles.page}>
      <SiteContainer className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 className={styles.heading}>{copy.heading}</h1>
            <p className={styles.intro}>{copy.intro}</p>
          </div>
          <form className={styles.form} action="/search">
            <label className={styles.inputWrap} htmlFor="q">
              <span className="sr-only">{copy.inputLabel}</span>
              <input
                id="q"
                name="q"
                defaultValue={term}
                placeholder={copy.placeholder}
                autoComplete="off"
              />
            </label>
            <button
              className={styles.submit}
              type="submit"
              aria-label={copy.submitLabel}
              title={copy.submitLabel}
            >
              <SearchIcon className={styles.submitIcon} />
            </button>
          </form>
        </header>

        {term ? (
          <>
            <div className={styles.resultMeta} aria-live="polite">
              <p>
                <strong>{products.length}</strong>{" "}
                {products.length === 1 ? copy.singleResultLabel : copy.multipleResultsLabel} {copy.resultsForLabel} “{term}”
              </p>
              {products.length > 0 && <span>{copy.resultsSuffix}</span>}
            </div>
            {products.length > 0 ? (
              <CollectionProductGrid products={products} content={collectionContent?.productGridContent} />
            ) : (
              <div className={styles.empty}>
                <div>
                  <h2>{copy.noResultsHeading}</h2>
                  <p>{copy.noResultsText}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <div>
              <h2>{copy.emptyHeading}</h2>
              <p>{copy.emptyText}</p>
            </div>
          </div>
        )}
      </SiteContainer>
    </main>
  );
}
