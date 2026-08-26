import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getOpenIdConfiguration, isCustomerAccountConfigured } from "@/lib/customer-account/client";

const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
const safeReturnTo = (value: string | null) => value?.startsWith("/account") ? value : "/account";

export async function GET(request: NextRequest) {
  if (!isCustomerAccountConfigured()) return NextResponse.redirect(new URL("/account/login?error=configuration", request.url));
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const callback = new URL("/api/customer-account/callback", request.nextUrl.origin).toString();
  const config = await getOpenIdConfiguration();
  const authorizationUrl = new URL(config.authorization_endpoint);
  authorizationUrl.searchParams.set("client_id", env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!);
  authorizationUrl.searchParams.set("scope", "openid email customer-account-api:full");
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", callback);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("nonce", nonce);
  authorizationUrl.searchParams.set("code_challenge", challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  const store = await cookies();
  store.set("ivory_customer_oauth_state", state, options);
  store.set("ivory_customer_oauth_verifier", verifier, options);
  store.set("ivory_customer_oauth_nonce", nonce, options);
  store.set("ivory_customer_return_to", safeReturnTo(request.nextUrl.searchParams.get("returnTo")), options);
  return NextResponse.redirect(authorizationUrl);
}
