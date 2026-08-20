import { NextResponse } from "next/server";
import { z } from "zod";
import { shopifyFetch } from "@/lib/shopify/client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/queries";
import type { Cart } from "@/lib/shopify/types";

const bodySchema = z.object({
  cartId: z.string().nullable().optional(),
  merchandiseId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
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

export async function GET(request: Request) {
  const cartId = new URL(request.url).searchParams.get("id");
  if (!cartId) return NextResponse.json({ cart: null });
  try {
    const { cart } = await shopifyFetch<{ cart: Cart | null }>({
      query: CART_QUERY,
      variables: { id: cartId },
      revalidate: false,
      tags: [],
    });
    return NextResponse.json({ cart });
  } catch {
    return NextResponse.json({ cart: null });
  }
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const lines = [
      { merchandiseId: body.merchandiseId, quantity: body.quantity },
    ];
    const result = body.cartId
      ? (
          await shopifyFetch<{ cartLinesAdd: MutationResult }>({
            query: CART_LINES_ADD_MUTATION,
            variables: { cartId: body.cartId, lines },
            revalidate: false,
            tags: [],
          })
        ).cartLinesAdd
      : (
          await shopifyFetch<{ cartCreate: MutationResult }>({
            query: CART_CREATE_MUTATION,
            variables: { input: { lines } },
            revalidate: false,
            tags: [],
          })
        ).cartCreate;
    if (result.userErrors.length || !result.cart)
      return NextResponse.json(
        { error: result.userErrors[0]?.message || "Cart could not be updated" },
        { status: 400 },
      );
    return NextResponse.json({ cart: result.cart });
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
          })
        ).cartLinesUpdate
      : (
          await shopifyFetch<{ cartLinesRemove: MutationResult }>({
            query: CART_LINES_REMOVE_MUTATION,
            variables: { cartId: body.cartId, lineIds: [body.lineId] },
            revalidate: false,
            tags: [],
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
