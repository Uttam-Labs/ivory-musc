import { NextRequest, NextResponse } from "next/server";
import { consumeOAuthState, customerApiFetchWithToken, exchangeCode } from "@/lib/customer-account/oauth";
import { setCustomerSession } from "@/lib/customer-account/session";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code"); const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(new URL("/account/login?error=cancelled", request.url));
  const stored = await consumeOAuthState(state);
  if (!stored) return NextResponse.redirect(new URL("/account/login?error=invalid-state", request.url));
  try {
    const token = await exchangeCode(code, stored.verifier);
    const profile = await customerApiFetchWithToken<{ customer: { firstName?: string; displayName?: string } }>(token.access_token!, `query SessionCustomer { customer { firstName displayName } }`);
    await setCustomerSession({ accessToken: token.access_token!, refreshToken: token.refresh_token, idToken: token.id_token, authMode: "customer-account-api", firstName: profile.customer.firstName || profile.customer.displayName?.split(/\s+/)[0], remember: true, expiresAt: Date.now() + Math.max(60, token.expires_in || 3600) * 1000 });
    return NextResponse.redirect(new URL(stored.next, request.url));
  } catch { return NextResponse.redirect(new URL("/account/login?error=callback", request.url)); }
}
