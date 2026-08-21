import { shopifyFetch } from "./client";
import { ARTICLE_QUERY, ARTICLES_QUERY, COLLECTION_QUERY, COLLECTIONS_QUERY, PRODUCT_QUERY, PRODUCT_RECOMMENDATIONS_QUERY, PRODUCTS_QUERY } from "./queries";
import type { Collection, Product, ShopifyArticle } from "./types";

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
export async function getArticles() {
  const articles: ShopifyArticle[] = [];
  let after: string | null = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const data: { articles: { nodes: ShopifyArticle[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await shopifyFetch({
      query: ARTICLES_QUERY,
      variables: { first: 100, after },
      tags: ["shopify", "articles"],
    });
    articles.push(...data.articles.nodes);
    hasNextPage = data.articles.pageInfo.hasNextPage;
    after = data.articles.pageInfo.endCursor;
    if (hasNextPage && !after) break;
  }
  return articles;
}
export async function getArticle(blogHandle: string, articleHandle: string) {
  const data = await shopifyFetch<{ blog: { articleByHandle: ShopifyArticle | null } | null }>({
    query: ARTICLE_QUERY,
    variables: { blogHandle, articleHandle },
    tags: ["shopify", "articles", `article:${articleHandle}`],
  });
  return data.blog?.articleByHandle || null;
}
