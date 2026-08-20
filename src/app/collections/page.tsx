import Link from "next/link";
import { CollectionProductGrid } from "@/components/collection-product-grid";
import { SiteContainer } from "@/components/site-container";
import { SetupNotice } from "@/components/setup-notice";
import { isShopifyConfigured } from "@/lib/env";
import { getProducts } from "@/lib/shopify";
import styles from "./collection.module.css";

export const metadata = { title: "Collection" };
const PAGE_SIZE = 12;

export default async function CollectionsPage({ searchParams }: PageProps<"/collections">) {
  if (!isShopifyConfigured) return <main className={styles.page}><SetupNotice /></main>;
  const { page: requestedPage } = await searchParams;
  const products = await getProducts(250);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const parsed = Number.parseInt(typeof requestedPage === "string" ? requestedPage : "1", 10) || 1;
  const page = Math.min(Math.max(parsed, 1), totalPages);
  const visibleProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = Math.max(1, Math.min(page - 1, totalPages - 3));
  const pages = Array.from({ length: Math.min(4, totalPages) }, (_, index) => start + index);
  return <main className={styles.page}><SiteContainer className={styles.inner}>
    <h1 className={styles.heading}>Collection</h1>
    <CollectionProductGrid products={visibleProducts} />
    {totalPages > 1 && <nav className={styles.pagination} aria-label="Collection pagination">
      {page > 1 && <Link className={styles.arrow} href={`/collections?page=${page - 1}`} aria-label="Previous page">‹</Link>}
      {start > 1 && <><Link href="/collections?page=1">1</Link>{start > 2 && <span>…</span>}</>}
      {pages.map((item) => <Link key={item} className={item === page ? styles.active : undefined} href={`/collections?page=${item}`} aria-current={item === page ? "page" : undefined}>{item}</Link>)}
      {pages.at(-1)! < totalPages && <>{pages.at(-1)! < totalPages - 1 && <span>…</span>}<Link href={`/collections?page=${totalPages}`}>{totalPages}</Link></>}
      {page < totalPages && <Link className={styles.arrow} href={`/collections?page=${page + 1}`} aria-label="Next page">›</Link>}
    </nav>}
  </SiteContainer></main>;
}
