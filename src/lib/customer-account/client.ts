import "server-only";
import { env, isShopifyConfigured } from "@/lib/env";
import { getCustomerSession } from "./session";
type GraphqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

export function isCustomerAccountConfigured() {
  return Boolean(isShopifyConfigured && env.CUSTOMER_ACCOUNT_SESSION_SECRET);
}

export async function storefrontCustomerFetch<T>(query: string, variables: Record<string, unknown> = {}) {
  if (!isShopifyConfigured) throw new Error("Shopify Storefront API is not configured");
  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN! },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const result = (await response.json()) as GraphqlResponse<T>;
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(result.errors?.map(({ message }) => message).join("; ") || `Shopify Storefront API failed (${response.status})`);
  }
  return result.data;
}

export async function customerAccountFetch<T>(query: string, variables: Record<string, unknown> = {}) {
  const session = await getCustomerSession();
  if (!session) throw new Error("CUSTOMER_AUTH_REQUIRED");
  return storefrontCustomerFetch<T>(query, { ...variables, customerAccessToken: session.accessToken });
}

export function encodeCustomerId(id: string) { return Buffer.from(id).toString("base64url"); }
export function decodeCustomerId(id: string) { return Buffer.from(id, "base64url").toString("utf8"); }
