import { Search } from "lucide-react";
import { CollectionProductGrid } from "@/components/collection-product-grid";
import { SiteContainer } from "@/components/site-container";
import { getProducts } from "@/lib/shopify";
import styles from "./search.module.css";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim() : "";
  const products = term ? await getProducts(24, term) : [];

  return (
    <main className={styles.page}>
      <SiteContainer className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Discover Ivory Muse</p>
            <h1 className={styles.heading}>Search our collection</h1>
            <p className={styles.intro}>
              Find silk fabrics by name, finish, colour or intended use.
            </p>
          </div>
          <form className={styles.form} action="/search">
            <label className={styles.inputWrap} htmlFor="q">
              <Search size={20} strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Search products</span>
              <input
                id="q"
                name="q"
                defaultValue={term}
                placeholder="What are you looking for?"
                autoComplete="off"
              />
            </label>
            <button className={styles.submit} type="submit">
              Search
            </button>
          </form>
        </header>

        {term ? (
          <>
            <div className={styles.resultMeta} aria-live="polite">
              <p>
                <strong>{products.length}</strong>{" "}
                {products.length === 1 ? "result" : "results"} for “{term}”
              </p>
              {products.length > 0 && <span>Explore the matching collection below</span>}
            </div>
            {products.length > 0 ? (
              <CollectionProductGrid products={products} />
            ) : (
              <div className={styles.empty}>
                <div>
                  <h2>No products found</h2>
                  <p>Try a different product name, colour or fabric type.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <div>
              <h2>Find your perfect silk</h2>
              <p>Enter a search term to explore the Ivory Muse collection.</p>
            </div>
          </div>
        )}
      </SiteContainer>
    </main>
  );
}
