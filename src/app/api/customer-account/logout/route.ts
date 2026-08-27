import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { storefrontCustomerFetch } from "@/lib/customer-account/client";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerSession,
} from "@/lib/customer-account/session";
export async function POST(request: NextRequest) {
  const session = await getCustomerSession();
  if (session)
    try {
      await storefrontCustomerFetch(
        `mutation Logout($customerAccessToken:String!){customerAccessTokenDelete(customerAccessToken:$customerAccessToken){deletedAccessToken userErrors{message}}}`,
        { customerAccessToken: session.accessToken },
      );
    } catch {}
  (await cookies()).delete(CUSTOMER_SESSION_COOKIE);
  return NextResponse.redirect(new URL("/account/login", request.url));
}

export async function GET(request: NextRequest) {
  (await cookies()).delete(CUSTOMER_SESSION_COOKIE);
  const destination = new URL("/account/login", request.url);
  if (request.nextUrl.searchParams.get("reason") === "expired")
    destination.searchParams.set("session", "expired");
  return NextResponse.redirect(destination);
}
