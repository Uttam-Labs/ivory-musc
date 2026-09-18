import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const OAUTH_COOKIE = "ivory_customer_oauth";
const scope = "openid email customer-account-api:full";
type Discovery = { authorization_endpoint: string; token_endpoint: string; end_session_endpoint?: string };
type OAuthState = { state: string; nonce: string; verifier: string; next: string; expiresAt: number };

function secret() {
  if (!env.CUSTOMER_ACCOUNT_SESSION_SECRET) throw new Error("Customer account session secret is missing");
  return env.CUSTOMER_ACCOUNT_SESSION_SECRET;
}
function b64(value: Buffer | string) { return Buffer.from(value).toString("base64url"); }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
function encode(value: OAuthState) { const payload = b64(JSON.stringify(value)); return `${payload}.${sign(payload)}`; }
function decode(value?: string): OAuthState | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try { const result = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthState; return result.expiresAt > Date.now() ? result : null; } catch { return null; }
}
export function customerAccountApiEnabled() { return Boolean(env.SHOPIFY_STORE_DOMAIN && env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID && env.NEXT_PUBLIC_SITE_URL); }
export async function discoverAuth(): Promise<Discovery> {
  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/.well-known/openid-configuration`, { cache: "no-store" });
  if (!response.ok) throw new Error("Shopify customer authentication is unavailable");
  return response.json() as Promise<Discovery>;
}
export async function discoverApi(): Promise<{ graphql_api: string }> {
  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/.well-known/customer-account-api`, { cache: "force-cache", next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("Shopify Customer Account API is unavailable");
  return response.json() as Promise<{ graphql_api: string }>;
}
export function callbackUrl() { return new URL("/api/customer-account/callback", env.NEXT_PUBLIC_SITE_URL).toString(); }
export async function createLogoutUrl(idToken: string) {
  const config = await discoverAuth();
  if (!config.end_session_endpoint) throw new Error("Shopify customer logout is unavailable");
  const url = new URL(config.end_session_endpoint);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", new URL("/", env.NEXT_PUBLIC_SITE_URL).toString());
  return url;
}
export async function createAuthorizationUrl(next = "/account") {
  const config = await discoverAuth();
  const state = b64(randomBytes(24)); const nonce = b64(randomBytes(24)); const verifier = b64(randomBytes(48));
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  (await cookies()).set(OAUTH_COOKIE, encode({ state, nonce, verifier, next: safeNext, expiresAt: Date.now() + 10 * 60_000 }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  const url = new URL(config.authorization_endpoint);
  url.searchParams.set("scope", scope); url.searchParams.set("client_id", env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!);
  url.searchParams.set("response_type", "code"); url.searchParams.set("redirect_uri", callbackUrl());
  url.searchParams.set("state", state); url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", challenge); url.searchParams.set("code_challenge_method", "S256");
  return url;
}
export async function consumeOAuthState(state: string) {
  const store = await cookies(); const value = decode(store.get(OAUTH_COOKIE)?.value); store.delete(OAUTH_COOKIE);
  return value?.state === state ? value : null;
}
export async function exchangeCode(code: string, verifier: string) {
  const config = await discoverAuth();
  const response = await fetch(config.token_endpoint, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", client_id: env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!, redirect_uri: callbackUrl(), code, code_verifier: verifier }) });
  const payload = await response.json() as { access_token?: string; refresh_token?: string; id_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || "Shopify sign-in could not be completed");
  return payload;
}
export async function customerApiFetchWithToken<T>(accessToken: string, query: string, variables: Record<string, unknown> = {}) {
  const { graphql_api } = await discoverApi();
  const response = await fetch(graphql_api, { method: "POST", headers: { "content-type": "application/json", Authorization: accessToken }, body: JSON.stringify({ query, variables }), cache: "no-store" });
  const payload = await response.json() as { data?: T; errors?: Array<{ message: string }> };
  if (!response.ok || payload.errors?.length || !payload.data) throw new Error(payload.errors?.map((item) => item.message).join("; ") || "Customer account request failed");
  return payload.data;
}
