import { NextResponse } from "next/server";
import type { ProductDetailsSettings } from "@/components/product-details";
import { isSanityConfigured } from "@/lib/env";
import { getHiddenProductHandles, isProductHidden } from "@/lib/product-visibility";
import { getProduct } from "@/lib/shopify";
import { sanityFetch } from "@/sanity/lib/client";
import { PRODUCT_PAGE_QUERY } from "@/sanity/lib/queries";

type ProductPageData = {
  sections?: Array<({ _type: "productDetailsSettings" } & ProductDetailsSettings)>;
} | null;

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/products/[handle]">,
) {
  const { handle } = await params;
  const [product, pageData, hiddenHandles] = await Promise.all([
    getProduct(handle),
    isSanityConfigured ? sanityFetch<ProductPageData>(PRODUCT_PAGE_QUERY) : null,
    getHiddenProductHandles(),
  ]);
  if (!product || isProductHidden(product, hiddenHandles)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const settings = pageData?.sections?.find(
    (section) => section._type === "productDetailsSettings",
  );
  const sampleProductHandle = settings?.sampleProductHandle?.trim() || "sample-proudct";
  const sampleProduct =
    handle === sampleProductHandle
      ? null
      : await getProduct(sampleProductHandle).catch(() => null);

  return NextResponse.json({ product, sampleProduct, settings });
}
