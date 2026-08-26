import "server-only";
import { env } from "@/lib/env";
import { getCustomerSession } from "./session";

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
};
type ApiConfiguration = { graphql_api: string };
type GraphqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

export function isCustomerAccountConfigured() {
  return Boolean(env.SHOPIFY_STORE_DOMAIN && env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID && env.CUSTOMER_ACCOUNT_SESSION_SECRET);
}

export async function getOpenIdConfiguration() {
  if (!env.SHOPIFY_STORE_DOMAIN) throw new Error("Shopify store domain is not configured");
  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/.well-known/openid-configuration`, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("Could not discover Shopify customer authentication endpoints");
  return response.json() as Promise<OpenIdConfiguration>;
}

async function getApiConfiguration() {
  if (!env.SHOPIFY_STORE_DOMAIN) throw new Error("Shopify store domain is not configured");
  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/.well-known/customer-account-api`, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("Could not discover Shopify Customer Account API");
  return response.json() as Promise<ApiConfiguration>;
}

export async function customerAccountFetch<T>(query: string, variables: Record<string, unknown> = {}) {
  const session = await getCustomerSession();
  if (!session) throw new Error("CUSTOMER_AUTH_REQUIRED");
  const { graphql_api } = await getApiConfiguration();
  const response = await fetch(graphql_api, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: session.accessToken },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const result = (await response.json()) as GraphqlResponse<T>;
  if (response.status === 401) throw new Error("CUSTOMER_AUTH_REQUIRED");
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(result.errors?.map(({ message }) => message).join("; ") || `Customer Account API failed (${response.status})`);
  }
  return result.data;
}

export function encodeCustomerId(id: string) { return Buffer.from(id).toString("base64url"); }
export function decodeCustomerId(id: string) { return Buffer.from(id, "base64url").toString("utf8"); }
