import { NextRequest, NextResponse } from "next/server";
import { storefrontCustomerFetch } from "@/lib/customer-account/client";
import {
  clearCustomerSession,
  getCustomerSession,
} from "@/lib/customer-account/session";
import { createLogoutUrl } from "@/lib/customer-account/oauth";
export async function POST(request: NextRequest) {
  const session = await getCustomerSession();
  let destination = new URL("/", request.url);
  if (session?.authMode === "customer-account-api" && session.idToken) {
    try {
      destination = await createLogoutUrl(session.idToken);
    } catch {}
  }
  if (session?.authMode !== "customer-account-api" && session)
    try {
      await storefrontCustomerFetch(
        `mutation Logout($customerAccessToken:String!){customerAccessTokenDelete(customerAccessToken:$customerAccessToken){deletedAccessToken userErrors{message}}}`,
        { customerAccessToken: session.accessToken },
      );
    } catch {}
  await clearCustomerSession();
  return NextResponse.redirect(destination, 303);
}

export async function GET(request: NextRequest) {
  await clearCustomerSession();
  const destination = new URL("/account/login", request.url);
  if (request.nextUrl.searchParams.get("reason") === "expired")
    destination.searchParams.set("session", "expired");
  return NextResponse.redirect(destination);
}
