import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails, type ProductDetailsSettings } from "@/components/product-details";
import { isSanityConfigured } from "@/lib/env";
import { getProduct, getProductRecommendations } from "@/lib/shopify";
import { sanityFetch } from "@/sanity/lib/client";
import { PRODUCT_PAGE_QUERY } from "@/sanity/lib/queries";

type ProductPageProps = { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
type ProductPageData = { sections?: Array<({ _type: "productDetailsSettings" } & ProductDetailsSettings) | { _type: "relatedProductsSettings"; heading?: string; productLimit?: number }> } | null;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> { const { handle } = await params; const product = await getProduct(handle); return product ? { title: product.title, description: product.description.slice(0, 160), openGraph: { images: product.featuredImage ? [product.featuredImage.url] : [] } } : {}; }

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();
  const [pageData, recommendations] = await Promise.all([
    isSanityConfigured ? sanityFetch<ProductPageData>(PRODUCT_PAGE_QUERY) : null,
    getProductRecommendations(product.id).catch(() => []),
  ]);
  const detailSettings = pageData?.sections?.find((section) => section._type === "productDetailsSettings") as (({ _type: "productDetailsSettings" } & ProductDetailsSettings) | undefined);
  const relatedSettings = pageData?.sections?.find((section) => section._type === "relatedProductsSettings") as ({ heading?: string; productLimit?: number } | undefined);
  const sampleProductHandle = detailSettings?.sampleProductHandle?.trim() || "sample-proudct";
  const sampleProduct = handle === sampleProductHandle ? null : await getProduct(sampleProductHandle).catch(() => null);
  const raw = await searchParams;
  const initialSelection = Object.fromEntries(Object.entries(raw).flatMap(([key, value]) => typeof value === "string" ? [[key, value]] : []));
  return <ProductDetails product={product} sampleProduct={sampleProduct} initialSelection={initialSelection} settings={detailSettings} relatedHeading={relatedSettings?.heading} relatedProducts={recommendations.slice(0, relatedSettings?.productLimit || 4)} />;
}
