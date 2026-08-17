import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") || "";
  if (!env.SHOPIFY_REVALIDATION_SECRET) return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 503 });
  const digest = createHmac("sha256", env.SHOPIFY_REVALIDATION_SECRET).update(rawBody, "utf8").digest("base64");
  const valid = signature.length === digest.length && timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  revalidateTag("shopify", "max");
  return NextResponse.json({ revalidated: true });
}
