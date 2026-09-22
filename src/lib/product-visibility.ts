import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { PRODUCT_VISIBILITY_QUERY } from "@/sanity/lib/queries";

const FALLBACK_HIDDEN_PRODUCT_HANDLES = "sample-proudct";

function parseHandles(value: string) {
  return new Set(
    value
      .split(",")
      .map((handle) => handle.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getHiddenProductHandles() {
  if (!isSanityConfigured) {
    return parseHandles(FALLBACK_HIDDEN_PRODUCT_HANDLES);
  }

  const settings = await sanityFetch<{ hiddenProductHandles?: string | null } | null>(
    PRODUCT_VISIBILITY_QUERY,
    {},
    ["sanity", "site-settings", "product-visibility"],
  );

  return parseHandles(
    settings?.hiddenProductHandles == null
      ? FALLBACK_HIDDEN_PRODUCT_HANDLES
      : settings.hiddenProductHandles,
  );
}

export function isProductHidden(
  product: { handle: string },
  hiddenHandles: ReadonlySet<string>,
) {
  return hiddenHandles.has(product.handle.trim().toLowerCase());
}
