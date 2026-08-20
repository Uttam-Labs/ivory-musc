import { NextResponse } from "next/server";
import { getProduct } from "@/lib/shopify";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/products/[handle]">,
) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}
