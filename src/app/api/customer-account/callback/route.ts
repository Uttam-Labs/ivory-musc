import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getOpenIdConfiguration } from "@/lib/customer-account/client";
import { CUSTOMER_SESSION_COOKIE, customerCookieOptions, encryptSession } from "@/lib/customer-account/session";

type TokenResponse = { access_token?: string; expires_in?: number; id_token?: string; error_description?: string };

export async function GET(request: NextRequest) {
  const store = await cookies();
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const expectedState = store.get("ivory_customer_oauth_state")?.value;
  const expectedNonce = store.get("ivory_customer_oauth_nonce")?.value;
  const verifier = store.get("ivory_customer_oauth_verifier")?.value;
  const returnTo = store.get("ivory_customer_return_to")?.value || "/account";
  if (!state || !code || !expectedState || state !== expectedState || !verifier || !expectedNonce) {
    return NextResponse.redirect(new URL("/account/login?error=invalid_callback", request.url));
  }
  const callback = new URL("/api/customer-account/callback", request.nextUrl.origin).toString();
  const config = await getOpenIdConfiguration();
  const response = await fetch(config.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", client_id: env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!, redirect_uri: callback, code, code_verifier: verifier }),
    cache: "no-store",
  });
  const token = (await response.json()) as TokenResponse;
  if (!response.ok || !token.access_token) return NextResponse.redirect(new URL("/account/login?error=token_exchange", request.url));
  if (token.id_token) {
    try {
      const payload = JSON.parse(Buffer.from(token.id_token.split(".")[1], "base64url").toString("utf8")) as { nonce?: string };
      if (payload.nonce !== expectedNonce) return NextResponse.redirect(new URL("/account/login?error=invalid_callback", request.url));
    } catch { return NextResponse.redirect(new URL("/account/login?error=invalid_callback", request.url)); }
  }
  store.set(CUSTOMER_SESSION_COOKIE, encryptSession({ accessToken: token.access_token, idToken: token.id_token, expiresAt: Date.now() + (token.expires_in || 3600) * 1000 }), { ...customerCookieOptions, maxAge: token.expires_in || 3600 });
  store.delete("ivory_customer_oauth_state");
  store.delete("ivory_customer_oauth_verifier");
  store.delete("ivory_customer_oauth_nonce");
  store.delete("ivory_customer_return_to");
  return NextResponse.redirect(new URL(returnTo.startsWith("/account") ? returnTo : "/account", request.url));
}
