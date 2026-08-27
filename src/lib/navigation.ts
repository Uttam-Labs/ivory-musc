export const SHOP_HREF = "/collections/shop";

export function normalizeShopHref(label?: string, href?: string) {
  const cleanHref = href?.trim() || "";
  const cleanLabel = label?.trim().toLowerCase() || "";

  if (
    cleanLabel === "shop" ||
    cleanLabel === "collection" ||
    cleanLabel === "collections" ||
    cleanHref === "/shop" ||
    cleanHref === "/collections" ||
    cleanHref.startsWith("/collections?")
  ) {
    return SHOP_HREF;
  }

  return cleanHref;
}
