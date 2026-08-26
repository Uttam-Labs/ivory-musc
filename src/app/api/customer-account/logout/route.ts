import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getOpenIdConfiguration } from "@/lib/customer-account/client";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession } from "@/lib/customer-account/session";

export async function GET(request: NextRequest) {
  const session = await getCustomerSession();
  (await cookies()).delete(CUSTOMER_SESSION_COOKIE);
  const config = await getOpenIdConfiguration();
  if (config.end_session_endpoint && session?.idToken) {
    const logout = new URL(config.end_session_endpoint);
    logout.searchParams.set("id_token_hint", session.idToken);
    logout.searchParams.set("post_logout_redirect_uri", new URL("/", request.nextUrl.origin).toString());
    logout.searchParams.set("client_id", env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!);
    return NextResponse.redirect(logout);
  }
  return NextResponse.redirect(new URL("/", request.url));
}
