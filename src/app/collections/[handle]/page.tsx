import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionProductGrid } from "@/components/collection-product-grid";
import { SiteContainer } from "@/components/site-container";
import { isSanityConfigured } from "@/lib/env";
import { getCollection } from "@/lib/shopify";
import { sanityFetch } from "@/sanity/lib/client";
import { COLLECTION_PAGE_QUERY } from "@/sanity/lib/queries";
import styles from "../collection.module.css";
const PAGE_SIZE = 12;
type CollectionPageSettings = { heading?: string };
export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const { page: requestedPage } = await searchParams;
  const [collection, pageSettings] = await Promise.all([
    getCollection(handle, 250),
    isSanityConfigured ? sanityFetch<CollectionPageSettings>(COLLECTION_PAGE_QUERY) : null,
  ]);
  if (!collection) notFound();
  const totalPages = Math.max(1, Math.ceil(collection.products.nodes.length / PAGE_SIZE));
  const parsed = Number.parseInt(typeof requestedPage === "string" ? requestedPage : "1", 10) || 1;
  const page = Math.min(Math.max(parsed, 1), totalPages);
  const base = `/collections/${handle}`;
  const products = collection.products.nodes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <main className={styles.page}><SiteContainer className={styles.inner}>
    {pageSettings?.heading && <h1 className={styles.heading}>{pageSettings.heading}</h1>}
    {collection.description && <p className={styles.intro}>{collection.description}</p>}
    <CollectionProductGrid products={products} />
    {totalPages > 1 && <nav className={styles.pagination} aria-label={`${collection.title} pagination`}>
      {page > 1 && <Link className={styles.arrow} href={`${base}?page=${page - 1}`}>‹</Link>}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <Link key={item} className={item === page ? styles.active : undefined} href={`${base}?page=${item}`}>{item}</Link>)}
      {page < totalPages && <Link className={styles.arrow} href={`${base}?page=${page + 1}`}>›</Link>}
    </nav>}
  </SiteContainer></main>;
}
