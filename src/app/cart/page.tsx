import type { Metadata } from "next";
import { CartPage, type CartPageCopy } from "./cart-page";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { STOREFRONT_CONTENT_QUERY } from "@/sanity/lib/queries";

type CartContent = { cartPage?: CartPageCopy & { seoTitle?: string; seoDescription?: string } } | null;
async function getContent() { return isSanityConfigured ? sanityFetch<CartContent>(STOREFRONT_CONTENT_QUERY, {}, ["sanity", "storefront-content"]) : null; }
export async function generateMetadata(): Promise<Metadata> {
  const data = await getContent();
  return {
    title: data?.cartPage?.seoTitle || "Shopping bag | Ivory Muse",
    description: data?.cartPage?.seoDescription || "Review your Ivory Muse selection and continue to secure checkout.",
  };
}

export default async function Page() {
  const data = await getContent();
  return <CartPage content={data?.cartPage} />;
}
