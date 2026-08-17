import { NextResponse } from "next/server";
import { getProducts } from "@/lib/shopify";

export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (term.length < 2) return NextResponse.json({ products: [] });
  try {
    const products = await getProducts(8, term);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
