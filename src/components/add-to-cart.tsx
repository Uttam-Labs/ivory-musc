"use client";
import { useState } from "react";
export function AddToCart({
  merchandiseId,
  disabled,
}: {
  merchandiseId: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">(
    "idle",
  );

  
  async function add() {
    setState("loading");
    try {
      const cartId = localStorage.getItem("shopify-cart-id");
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cartId, merchandiseId, quantity: 1 }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      localStorage.setItem("shopify-cart-id", payload.cart.id);
      window.dispatchEvent(
        new CustomEvent("cart:updated", { detail: payload.cart }),
      );
      setState("added");
    } catch {
      setState("error");
    }
  }
  return (
    <button
      type="button"
      onClick={add}
      disabled={disabled || state === "loading"}
      className="mt-8 w-full rounded-full bg-stone-950 px-6 py-4 text-white disabled:cursor-not-allowed disabled:bg-stone-400"
    >
      {disabled
        ? "Sold out"
        : state === "loading"
          ? "Adding…"
          : state === "added"
            ? "Added to cart"
            : state === "error"
              ? "Try again"
              : "Add to cart"}
    </button>
  );
}
