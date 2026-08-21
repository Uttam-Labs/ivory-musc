import { NextResponse, type NextRequest } from "next/server";
import { createPreviewSessionToken, PREVIEW_COOKIE_NAME, safeEqual } from "@/lib/preview-auth";

export async function proxy(request: NextRequest) {
  const passwordProtected = process.env.PREVIEW_PASSWORD_PROTECTED === "true";
  const username = process.env.PREVIEW_USERNAME;
  const password = process.env.PREVIEW_PASSWORD;
  const secret = process.env.PREVIEW_AUTH_SECRET || password;
  if (!passwordProtected || !username || !password || !secret) return NextResponse.next();

  const suppliedToken = request.cookies.get(PREVIEW_COOKIE_NAME)?.value || "";
  const expectedToken = await createPreviewSessionToken(secret);
  if (safeEqual(suppliedToken, expectedToken)) return NextResponse.next();

  const loginUrl = new URL("/preview-login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!waitlist(?:/|$)|preview-login(?:/|$)|api/waitlist(?:/|$)|api/preview-login(?:/|$)|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
