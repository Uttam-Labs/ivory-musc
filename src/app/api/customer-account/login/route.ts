import { NextRequest, NextResponse } from "next/server";
import { createAuthorizationUrl, customerAccountApiEnabled } from "@/lib/customer-account/oauth";
export async function GET(request: NextRequest) {
  if (!customerAccountApiEnabled()) return NextResponse.redirect(new URL("/account/login?error=configuration", request.url));
  try { return NextResponse.redirect(await createAuthorizationUrl(request.nextUrl.searchParams.get("next") || "/account")); }
  catch { return NextResponse.redirect(new URL("/account/login?error=unavailable", request.url)); }
}
