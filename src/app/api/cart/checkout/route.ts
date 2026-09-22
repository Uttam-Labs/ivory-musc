import { NextResponse } from "next/server";
import { z } from "zod";
import { shopifyFetch } from "@/lib/shopify/client";
import { getCustomerSession } from "@/lib/customer-account/session";
import { CART_ATTRIBUTES_UPDATE_MUTATION, CART_BUYER_IDENTITY_UPDATE_MUTATION, CART_LINES_UPDATE_MUTATION } from "@/lib/shopify/queries";
import type { Cart } from "@/lib/shopify/types";

const schema = z.object({ cartId: z.string().min(1) });
const normalizedAttributeKey = (key: string) => key.replace(/^_+/, "").trim().toLowerCase();
export async function POST(request: Request) {
  try {
    const { cartId } = schema.parse(await request.json());
    const buyerIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const session = await getCustomerSession();
    const { cartBuyerIdentityUpdate } = await shopifyFetch<{
      cartBuyerIdentityUpdate: { cart: Cart | null; userErrors: Array<{ message: string }> };
    }>({
      query: CART_BUYER_IDENTITY_UPDATE_MUTATION,
      variables: {
        cartId,
        buyerIdentity: session
          ? { customerAccessToken: session.accessToken }
          : { customerAccessToken: null, email: null, phone: null },
      },
      revalidate: false,
      tags: [],
      buyerIp,
    });
    if (cartBuyerIdentityUpdate.userErrors.length)
      return NextResponse.json(
        { error: cartBuyerIdentityUpdate.userErrors[0].message },
        { status: 400 },
      );
    let cart = cartBuyerIdentityUpdate.cart;
    if (!cart?.checkoutUrl || cart.totalQuantity < 1)
      return NextResponse.json(
        { error: "Your cart is empty or has expired." },
        { status: 400 },
      );
    const sampleLineUpdates = cart.lines.nodes.flatMap((line) => {
      const isSample = line.attributes.some(
        (attribute) => normalizedAttributeKey(attribute.key) === "type" && attribute.value.toLowerCase() === "sample",
      );
      if (!isSample) return [];
      const attributes = line.attributes.filter(
        (attribute) => !/^(?:type|sample size)$/i.test(normalizedAttributeKey(attribute.key)),
      );
      return [{ id: line.id, attributes: [{ key: "_type", value: "sample" }, ...attributes] }];
    });
    if (sampleLineUpdates.length) {
      const cleanup = await shopifyFetch<{
        cartLinesUpdate: { cart: Cart | null; userErrors: Array<{ message: string }> };
      }>({
        query: CART_LINES_UPDATE_MUTATION,
        variables: { cartId, lines: sampleLineUpdates },
        revalidate: false,
        tags: [],
        buyerIp,
      });
      if (cleanup.cartLinesUpdate.userErrors.length || !cleanup.cartLinesUpdate.cart)
        return NextResponse.json(
          { error: cleanup.cartLinesUpdate.userErrors[0]?.message || "Checkout details could not be prepared." },
          { status: 400 },
        );
      cart = cleanup.cartLinesUpdate.cart;
    }
    const correlation = await shopifyFetch<{
      cartAttributesUpdate: { cart: Cart | null; userErrors: Array<{ message: string }> };
    }>({
      query: CART_ATTRIBUTES_UPDATE_MUTATION,
      variables: {
        cartId,
        attributes: [{ key: "_ivory_muse_cart_id", value: cartId }],
      },
      revalidate: false,
      tags: [],
      buyerIp,
    });
    if (correlation.cartAttributesUpdate.userErrors.length)
      return NextResponse.json(
        { error: correlation.cartAttributesUpdate.userErrors[0].message },
        { status: 400 },
      );
    return NextResponse.json(
      { checkoutUrl: cart.checkoutUrl },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout could not be started.",
      },
      { status: 400 },
    );
  }
}
