import { shopifyFetch } from "./client";
import { COLLECTION_QUERY, COLLECTIONS_QUERY, PRODUCT_QUERY, PRODUCT_RECOMMENDATIONS_QUERY, PRODUCTS_QUERY } from "./queries";
import type { Collection, Product } from "./types";

export async function getProducts(first = 12, query?: string) {
  const data = await shopifyFetch<{ products: { nodes: Product[] } }>({ query: PRODUCTS_QUERY, variables: { first, query }, tags: ["shopify", "products"] });
  return data.products.nodes;
}
export async function getProduct(handle: string) {
  const data = await shopifyFetch<{ product: Product | null }>({ query: PRODUCT_QUERY, variables: { handle }, tags: ["shopify", `product:${handle}`] });
  return data.product;
}
export async function getProductRecommendations(productId: string) {
  const data = await shopifyFetch<{ productRecommendations: Product[] }>({
    query: PRODUCT_RECOMMENDATIONS_QUERY,
    variables: { productId },
    tags: ["shopify", "product-recommendations", `product:${productId}`],
  });
  return data.productRecommendations;
}
export async function getCollections(first = 20) {
  const data = await shopifyFetch<{ collections: { nodes: Collection[] } }>({ query: COLLECTIONS_QUERY, variables: { first }, tags: ["shopify", "collections"] });
  return data.collections.nodes;
}
export async function getCollection(handle: string, first = 24) {
  const data = await shopifyFetch<{ collection: (Collection & { products: { nodes: Product[] } }) | null }>({ query: COLLECTION_QUERY, variables: { handle, first }, tags: ["shopify", `collection:${handle}`] });
  return data.collection;
}
