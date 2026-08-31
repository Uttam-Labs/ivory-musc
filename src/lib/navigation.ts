export const SHOP_HREF = "/collections/shop";

export function normalizeShopHref(label?: string, href?: string) {
  const cleanHref = href?.trim() || "";
  const cleanLabel = label?.trim().toLowerCase() || "";

  const policyRoutes: Record<string, string> = {
    shipping: "/shipping-delivery",
    "shipping & delivery": "/shipping-delivery",
    returns: "/returns-refunds",
    "returns & refunds": "/returns-refunds",
    "privacy policy": "/privacy-policy",
    "terms & conditions": "/terms-conditions",
  };
  const legacyPolicyRoutes: Record<string, string> = {
    "/shipping": "/shipping-delivery",
    "/returns": "/returns-refunds",
    "/privacy": "/privacy-policy",
    "/terms": "/terms-conditions",
  };

  if (policyRoutes[cleanLabel]) return policyRoutes[cleanLabel];
  if (legacyPolicyRoutes[cleanHref]) return legacyPolicyRoutes[cleanHref];

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
