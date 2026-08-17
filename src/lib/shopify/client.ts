import "server-only";
import { env, isShopifyConfigured } from "@/lib/env";

type GraphQLError = { message: string };
type ShopifyResponse<T> = { data?: T; errors?: GraphQLError[] };

export class ShopifyConfigurationError extends Error {}

export async function shopifyFetch<T>({
  query,
  variables,
  tags = ["shopify"],
  revalidate = 300,
}: {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  if (!isShopifyConfigured) throw new ShopifyConfigurationError("Shopify is not configured");

  const response = await fetch(
    `https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate, tags },
    },
  );

  const result = (await response.json()) as ShopifyResponse<T>;
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(result.errors?.map(({ message }) => message).join("; ") || `Shopify request failed (${response.status})`);
  }
  return result.data;
}
