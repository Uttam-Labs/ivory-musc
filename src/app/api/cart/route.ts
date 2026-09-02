import { NextResponse } from "next/server";
import { z } from "zod";
import { shopifyFetch } from "@/lib/shopify/client";
import {
  CART_CREATE_MUTATION,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/queries";
import type { Cart } from "@/lib/shopify/types";
import { getCustomerSession } from "@/lib/customer-account/session";
import { customerAccountFetch } from "@/lib/customer-account/client";

const bodySchema = z.object({
  cartId: z.string().nullable().optional(),
  merchandiseId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
  attributes: z.array(z.object({ key: z.string().min(1).max(255), value: z.string().max(255) })).max(10).optional(),
});
const changeLineSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    cartId: z.string().min(1),
    lineId: z.string().min(1),
    quantity: z.number().int().min(1).max(20),
  }),
  z.object({
    action: z.literal("remove"),
    cartId: z.string().min(1),
    lineId: z.string().min(1),
  }),
]);
type MutationResult = {
  cart: Cart | null;
  userErrors: Array<{ message: string }>;
};
const buyerIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  undefined;

export async function GET(request: Request) {
  const cartId = new URL(request.url).searchParams.get("id");
  if (!cartId) return NextResponse.json({ cart: null });
  try {
    const { cart } = await shopifyFetch<{ cart: Cart | null }>({
      query: CART_QUERY,
      variables: { id: cartId },
      revalidate: false,
      tags: [],
      buyerIp: buyerIp(request),
    });
    if (cart && await cartHasCompletedOrder(cartId))
      return NextResponse.json({ cart: null, completed: true });
    return NextResponse.json({ cart });
  } catch {
    return NextResponse.json({ cart: null });
  }
}

async function cartHasCompletedOrder(cartId: string) {
  const session = await getCustomerSession();
  if (!session) return false;
  try {
    const data = await customerAccountFetch<{
      customer: { orders: { nodes: Array<{ customAttributes: Array<{ key: string; value?: string | null }> }> } } | null;
    }>(`query CompletedCart($customerAccessToken:String!){customer(customerAccessToken:$customerAccessToken){orders(first:10,reverse:true){nodes{customAttributes{key value}}}}}`);
    return Boolean(data.customer?.orders.nodes.some((order) =>
      order.customAttributes.some((attribute) => attribute.key === "_ivory_muse_cart_id" && attribute.value === cartId),
    ));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const isSample = body.attributes?.some((attribute) => attribute.key.toLowerCase() === "type" && attribute.value.toLowerCase() === "sample") || false;
    if (isSample && body.quantity !== 1)
      return NextResponse.json({ error: "Only one sample can be purchased." }, { status: 400 });
    if (isSample && body.cartId) {
      const existing = await shopifyFetch<{ cart: Cart | null }>({ query: CART_QUERY, variables: { id: body.cartId }, revalidate: false, tags: [], buyerIp: buyerIp(request) }).catch(() => ({ cart: null }));
      const sampleLines = existing.cart?.lines.nodes.filter((line) => line.attributes.some((attribute) => attribute.key.toLowerCase() === "type" && attribute.value.toLowerCase() === "sample")) || [];
      const alreadyAdded = sampleLines.some((line) => line.merchandise.id === body.merchandiseId);
      if (alreadyAdded) return NextResponse.json({ error: "This sample is already in your cart." }, { status: 400 });
      if (sampleLines.reduce((total, line) => total + line.quantity, 0) >= 10)
        return NextResponse.json({ error: "A maximum of 10 samples can be purchased per order." }, { status: 400 });
    }
    const lines = [
      { merchandiseId: body.merchandiseId, quantity: body.quantity, ...(body.attributes?.length ? { attributes: body.attributes } : {}) },
    ];
    let result = body.cartId
      ? (
          await shopifyFetch<{ cartLinesAdd: MutationResult }>({
            query: CART_LINES_ADD_MUTATION,
            variables: { cartId: body.cartId, lines },
            revalidate: false,
            tags: [],
            buyerIp: buyerIp(request),
          })
        ).cartLinesAdd
      : (
          await shopifyFetch<{ cartCreate: MutationResult }>({
            query: CART_CREATE_MUTATION,
            variables: { input: { lines } },
            revalidate: false,
            tags: [],
            buyerIp: buyerIp(request),
          })
        ).cartCreate;
    // A cart becomes unusable after checkout and Shopify can also expire old
    // cart IDs. Transparently create a new cart instead of making the customer
    // retry (which previously made a successful add look intermittent).
    if ((!result.cart || result.userErrors.length) && body.cartId) {
      result = (
        await shopifyFetch<{ cartCreate: MutationResult }>({
          query: CART_CREATE_MUTATION,
          variables: { input: { lines } },
          revalidate: false,
          tags: [],
          buyerIp: buyerIp(request),
        })
      ).cartCreate;
    }
    if (result.userErrors.length || !result.cart)
      return NextResponse.json(
        { error: result.userErrors[0]?.message || "Cart could not be updated" },
        { status: 400 },
      );
    const session = await getCustomerSession();
    let cart = result.cart;
    // Attaching the signed-in customer is helpful for checkout, but it must not
    // turn a completed line add into an error. Otherwise a retry adds the same
    // item twice even though the first mutation already succeeded.
    try {
      const identityResult = (
        await shopifyFetch<{ cartBuyerIdentityUpdate: MutationResult }>({
          query: CART_BUYER_IDENTITY_UPDATE_MUTATION,
          variables: {
            cartId: cart.id,
            buyerIdentity: session
              ? { customerAccessToken: session.accessToken }
              : { customerAccessToken: null, email: null, phone: null },
          },
          revalidate: false,
          tags: [],
          buyerIp: buyerIp(request),
        })
      ).cartBuyerIdentityUpdate;
      if (!identityResult.userErrors.length && identityResult.cart)
        cart = identityResult.cart;
    } catch {
      // The line mutation is already complete; return that authoritative cart.
    }
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = changeLineSchema.parse(await request.json());
    const result = body.action === "update"
      ? (
          await shopifyFetch<{ cartLinesUpdate: MutationResult }>({
            query: CART_LINES_UPDATE_MUTATION,
            variables: {
              cartId: body.cartId,
              lines: [{ id: body.lineId, quantity: body.quantity }],
            },
            revalidate: false,
            tags: [],
            buyerIp: buyerIp(request),
          })
        ).cartLinesUpdate
      : (
          await shopifyFetch<{ cartLinesRemove: MutationResult }>({
            query: CART_LINES_REMOVE_MUTATION,
            variables: { cartId: body.cartId, lineIds: [body.lineId] },
            revalidate: false,
            tags: [],
            buyerIp: buyerIp(request),
          })
        ).cartLinesRemove;
    if (result.userErrors.length || !result.cart) {
      return NextResponse.json(
        { error: result.userErrors[0]?.message || "Cart could not be updated" },
        { status: 400 },
      );
    }
    return NextResponse.json({ cart: result.cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}
