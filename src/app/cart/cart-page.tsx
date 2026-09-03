"use client";

import Image from "next/image";
import Link from "next/link";
import { LoaderCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/format";
import type { Cart } from "@/lib/shopify/types";
import styles from "./cart.module.css";

const CART_KEY = "shopify-cart-id";
const CHECKOUT_CART_KEY = "shopify-checkout-cart-id";
type CartLine = Cart["lines"]["nodes"][number];
const isSampleLine = (line: CartLine) => line.attributes.some((attribute) => attribute.key.toLowerCase() === "type" && attribute.value.toLowerCase() === "sample");
const mainProductTitle = (line: CartLine) => line.attributes.find((attribute) => attribute.key.toLowerCase() === "main product")?.value;

export function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [updatingLines, setUpdatingLines] = useState<string[]>([]);
  const [error, setError] = useState("");
  const loadVersion = useRef(0);
  const changingLines = useRef(new Set<string>());
  const cartMutationFresh = useRef(false);
  const cartMutationTimer = useRef<number | null>(null);

  const markCartMutation = useCallback(() => {
    cartMutationFresh.current = true;
    if (cartMutationTimer.current) window.clearTimeout(cartMutationTimer.current);
    cartMutationTimer.current = window.setTimeout(() => {
      cartMutationFresh.current = false;
    }, 2500);
  }, []);

  const loadCart = useCallback(async () => {
    if (cartMutationFresh.current) return;
    const version = ++loadVersion.current;
    const cartId = window.localStorage.getItem(CART_KEY);
    if (!cartId) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/cart?id=${encodeURIComponent(cartId)}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as { cart?: Cart | null };
      if (version !== loadVersion.current) return;
      if (!response.ok || !payload.cart) {
        window.localStorage.removeItem(CART_KEY);
        window.localStorage.removeItem(CHECKOUT_CART_KEY);
        setCart(null);
      } else setCart(payload.cart);
    } catch {
      setError("Your shopping bag could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCart(), 0);
    const onPageShow = () => void loadCart();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void loadCart();
    };
    const checkoutRetryTimers = window.localStorage.getItem(CHECKOUT_CART_KEY)
      ? [window.setTimeout(() => void loadCart(), 1800), window.setTimeout(() => void loadCart(), 5000)]
      : [];
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      checkoutRetryTimers.forEach((retryTimer) => window.clearTimeout(retryTimer));
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadCart]);

  async function changeLine(lineId: string, quantity?: number) {
    if (!cart?.id || changingLines.current.has(lineId)) return;
    changingLines.current.add(lineId);
    setUpdatingLines((current) => [...current, lineId]);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: quantity === undefined ? "remove" : "update",
          cartId: cart.id,
          lineId,
          ...(quantity === undefined ? {} : { quantity }),
        }),
      });
      const payload = (await response.json()) as { cart?: Cart; error?: string };
      if (!response.ok || !payload.cart)
        throw new Error(payload.error || "Your shopping bag could not be updated.");
      markCartMutation();
      loadVersion.current += 1;
      setCart(payload.cart);
      window.dispatchEvent(new CustomEvent("cart:changed", { detail: payload.cart }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
    } finally {
      changingLines.current.delete(lineId);
      setUpdatingLines((current) => current.filter((id) => id !== lineId));
    }
  }

  async function checkout() {
    if (!cart?.id || checkoutLoading) return;
    setCheckoutLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: cart.id }),
      });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl)
        throw new Error(payload.error || "Checkout could not be started.");
      window.localStorage.setItem(CHECKOUT_CART_KEY, cart.id);
      window.location.assign(payload.checkoutUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
      setCheckoutLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        {loading ? (
          <div className={styles.state} role="status">
            <LoaderCircle className={styles.spinner} />
            <p>Preparing your shopping bag…</p>
          </div>
        ) : cart?.lines.nodes.length ? (
          <div className={styles.layout}>
            <section className={styles.items} aria-label="Shopping bag items">
              <div className={styles.itemsHeading}>
                <h2>Your pieces</h2>
                <span>{cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"}</span>
              </div>
              {cart.lines.nodes.map((line) => {
                const updating = updatingLines.includes(line.id);
                const sample = isSampleLine(line);
                return (
                  <article className={styles.item} key={line.id}>
                    <Link className={styles.image} href={`/products/${line.merchandise.product.handle}`}>
                      {line.merchandise.image ? (
                        <Image
                          src={line.merchandise.image.url}
                          alt={line.merchandise.image.altText || line.merchandise.product.title}
                          fill
                          quality={95}
                          sizes="(max-width: 640px) 112px, 170px"
                        />
                      ) : <ShoppingBag aria-hidden="true" />}
                    </Link>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemTop}>
                        <div>
                          <Link href={`/products/${line.merchandise.product.handle}`}>
                            <h3>{line.merchandise.product.title}</h3>
                          </Link>
                          {line.merchandise.title !== "Default Title" && <p>{line.merchandise.title}</p>}
                          {sample && <p className={styles.sampleType}>Type: Sample</p>}
                          {mainProductTitle(line) && <p>Main Product: {mainProductTitle(line)}</p>}
                        </div>
                        <button
                          type="button"
                          className={styles.remove}
                          aria-label={`Remove ${line.merchandise.product.title}`}
                          disabled={updating}
                          onClick={() => changeLine(line.id)}
                        >
                          {updating ? <LoaderCircle className={styles.spinner} size={17} /> : <Trash2 size={18} />}
                        </button>
                      </div>
                      <div className={styles.itemBottom}>
                        {sample ? <p className={styles.sampleQuantity}>Quantity: 1</p> : <div className={styles.quantity} aria-label="Quantity selector">
                          <button
                            type="button"
                            aria-label={`Decrease ${line.merchandise.product.title} quantity`}
                            disabled={updating || line.quantity <= 1}
                            onClick={() => changeLine(line.id, line.quantity - 1)}
                          ><Minus size={14} /></button>
                          <span>{line.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${line.merchandise.product.title} quantity`}
                            disabled={updating || line.quantity >= 20}
                            onClick={() => changeLine(line.id, line.quantity + 1)}
                          ><Plus size={14} /></button>
                        </div>}
                        <div className={styles.price}>
                          <strong>{formatMoney(line.cost.totalAmount)}</strong>
                          <span>{line.quantity} × {formatMoney(line.cost.amountPerQuantity)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className={styles.summary}>
              <p className={styles.summaryEyebrow}>Order summary</p>
              <h2>Summary</h2>
              <div className={styles.summaryRow}><span>Subtotal</span><strong>{formatMoney(cart.cost.subtotalAmount)}</strong></div>
              <div className={styles.summaryRow}><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className={styles.total}><span>Estimated total</span><strong>{formatMoney(cart.cost.totalAmount)}</strong></div>
              <p className={styles.note}>Taxes and delivery options are calculated securely at checkout.</p>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button className={styles.checkout} type="button" onClick={checkout} disabled={checkoutLoading}>
                {checkoutLoading && <LoaderCircle className={styles.spinner} size={18} />}
                {checkoutLoading ? "Preparing checkout…" : "Secure checkout"}
              </button>
              <p className={styles.secure}>Secure checkout powered by Shopify</p>
            </aside>
          </div>
        ) : (
          <section className={styles.empty}>
            <span><ShoppingBag size={31} strokeWidth={1.25} /></span>
            <p className={styles.eyebrow}>Your collection awaits</p>
            <h2>Your shopping bag is empty</h2>
            <p>Discover considered silks selected for timeless garments and interiors.</p>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <Link href="/collections/shop">Continue shopping</Link>
          </section>
        )}
      </div>
    </main>
  );
}
