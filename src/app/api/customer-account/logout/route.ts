import { NextRequest, NextResponse } from "next/server";
import { storefrontCustomerFetch } from "@/lib/customer-account/client";
import {
  clearCustomerSession,
  getCustomerSession,
} from "@/lib/customer-account/session";
export async function POST(request: NextRequest) {
  const session = await getCustomerSession();
  if (session?.authMode !== "customer-account-api" && session)
    try {
      await storefrontCustomerFetch(
        `mutation Logout($customerAccessToken:String!){customerAccessTokenDelete(customerAccessToken:$customerAccessToken){deletedAccessToken userErrors{message}}}`,
        { customerAccessToken: session.accessToken },
      );
    } catch {}
  await clearCustomerSession();
  return NextResponse.redirect(new URL("/account/login", request.url));
}

export async function GET(request: NextRequest) {
  await clearCustomerSession();
  const destination = new URL("/account/login", request.url);
  if (request.nextUrl.searchParams.get("reason") === "expired")
    destination.searchParams.set("session", "expired");
  return NextResponse.redirect(destination);
}
