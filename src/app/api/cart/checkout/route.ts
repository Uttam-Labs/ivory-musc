import { NextResponse } from "next/server";
import { z } from "zod";
import { shopifyFetch } from "@/lib/shopify/client";
import { getCustomerSession } from "@/lib/customer-account/session";
import { CART_BUYER_IDENTITY_UPDATE_MUTATION } from "@/lib/shopify/queries";
import type { Cart } from "@/lib/shopify/types";

const schema = z.object({ cartId: z.string().min(1) });
const CHECKOUT_QUERY = `query FreshCheckout($id:ID!){cart(id:$id){checkoutUrl totalQuantity}}`;

export async function POST(request: Request) {
  try {
    const { cartId } = schema.parse(await request.json());
    const buyerIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const session = await getCustomerSession();
    let cart: { checkoutUrl: string; totalQuantity: number } | null;
    if (session) {
      const { cartBuyerIdentityUpdate } = await shopifyFetch<{
        cartBuyerIdentityUpdate: { cart: Cart | null; userErrors: Array<{ message: string }> };
      }>({
        query: CART_BUYER_IDENTITY_UPDATE_MUTATION,
        variables: { cartId, buyerIdentity: { customerAccessToken: session.accessToken } },
        revalidate: false,
        tags: [],
        buyerIp,
      });
      if (cartBuyerIdentityUpdate.userErrors.length)
        return NextResponse.json(
          { error: cartBuyerIdentityUpdate.userErrors[0].message },
          { status: 400 },
        );
      cart = cartBuyerIdentityUpdate.cart;
    } else {
      ({ cart } = await shopifyFetch<{
        cart: { checkoutUrl: string; totalQuantity: number } | null;
      }>({
        query: CHECKOUT_QUERY,
        variables: { id: cartId },
        revalidate: false,
        tags: [],
        buyerIp,
      }));
    }
    if (!cart?.checkoutUrl || cart.totalQuantity < 1)
      return NextResponse.json(
        { error: "Your cart is empty or has expired." },
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
