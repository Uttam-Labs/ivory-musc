import { NextResponse } from "next/server";
import { z } from "zod";
import { createPreviewSessionToken, PREVIEW_COOKIE_NAME, safeEqual } from "@/lib/preview-auth";

const schema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(240),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const username = process.env.PREVIEW_USERNAME || "";
    const password = process.env.PREVIEW_PASSWORD || "";
    const secret = process.env.PREVIEW_AUTH_SECRET || password;
    if (!username || !password || !secret) {
      return NextResponse.json({ error: "Preview login is not configured." }, { status: 503 });
    }
    if (!safeEqual(input.username, username) || !safeEqual(input.password, password)) {
      return NextResponse.json({ error: "The username or password is incorrect." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(PREVIEW_COOKIE_NAME, await createPreviewSessionToken(secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please enter your username and password." }, { status: 400 });
    }
    return NextResponse.json({ error: "Login could not be completed." }, { status: 500 });
  }
}
