"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, LoaderCircle, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/format";
import type {
  Product,
  ProductOptionValue,
  ProductVariant,
  ShopifyImage,
} from "@/lib/shopify/types";
import styles from "@/app/collections/collection.module.css";

const colorFallbacks: Record<string, string> = {
  ivory: "#f7f3e8",
  champagne: "#dbcaa4",
  "blush rose": "#d8a6a0",
  blush: "#d8a6a0",
  "soft sand": "#d4bea0",
  sand: "#d4bea0",
  onyx: "#28282b",
  black: "#28282b",
  white: "#ffffff",
  cream: "#f4ead2",
  gold: "#c7a35c",
  silver: "#bfc0c0",
  red: "#a34842",
  blue: "#59718f",
  green: "#677862",
  pink: "#dcaeae",
};

function QuickCartIcon() {
  return (
    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M11.7345 17.3563H3.2596C1.46682 17.3563 0 15.6827 0 13.6371V13.5132L0.325959 3.59524C0.380286 1.54967 1.8471 0 3.58556 0H11.4086C13.147 0 14.6139 1.54967 14.6682 3.59524L14.9941 13.5132C15.0485 14.5049 14.7225 15.4347 14.1249 16.1786C13.5273 16.9224 12.7124 17.3563 11.8432 17.3563H11.7345ZM3.58556 1.23974C2.39037 1.23974 1.46682 2.29352 1.41249 3.59524L1.08653 13.6371C1.08653 15.0008 2.06441 16.1166 3.2596 16.1166H11.8432C12.4408 16.1166 12.9841 15.8067 13.3643 15.3108C13.7446 14.8149 13.9619 14.195 13.9619 13.5132L13.636 3.59524C13.5816 2.23153 12.6581 1.23974 11.4629 1.23974H3.58556Z" fill="currentColor" />
      <path d="M7.49819 7.43869C5.37945 7.43869 3.69533 5.5171 3.69533 3.09961C3.69533 2.72768 3.91263 2.47974 4.23859 2.47974C4.56455 2.47974 4.78186 2.72768 4.78186 3.09961C4.78186 4.83524 5.97704 6.19895 7.49819 6.19895C9.01933 6.19895 10.2145 4.83524 10.2145 3.09961C10.2145 2.72768 10.4318 2.47974 10.7578 2.47974C11.0837 2.47974 11.3011 2.72768 11.3011 3.09961C11.3011 5.5171 9.61693 7.43869 7.49819 7.43869Z" fill="currentColor" />
    </svg>
  );
}

function isColorOption(name: string) {
  return /colou?r|shade|finish/i.test(name);
}

function swatchStyle(value: ProductOptionValue) {
  const image = value.swatch?.image?.previewImage?.url;
  return image
    ? { backgroundImage: `url(${image})` }
    : { backgroundColor: value.swatch?.color || colorFallbacks[value.name.toLowerCase()] || "#eee9e1" };
}

function ProductQuickView({
  handle,
  onClose,
}: {
  handle: string;
  onClose: () => void;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState<"idle" | "cart" | "buy" | "added">("idle");
  const [activeImage, setActiveImage] = useState<ShopifyImage | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products/${encodeURIComponent(handle)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Product could not be loaded");
        const nextProduct = payload.product as Product;
        const initialVariant =
          nextProduct.variants.nodes.find((variant) => variant.availableForSale) ||
          nextProduct.variants.nodes[0];
        setProduct(nextProduct);
        setSelected(
          Object.fromEntries(
            (initialVariant?.selectedOptions || []).map((option) => [option.name, option.value]),
          ),
        );
        setActiveImage(initialVariant?.image || nextProduct.featuredImage);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [handle]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const variant = useMemo<ProductVariant | undefined>(() => {
    return product?.variants.nodes.find((item) =>
      item.selectedOptions.every((option) => selected[option.name] === option.value),
    );
  }, [product, selected]);

  function selectOption(name: string, value: string) {
    const next = { ...selected, [name]: value };
    setSelected(next);
    const nextVariant = product?.variants.nodes.find((item) =>
      item.selectedOptions.every((option) => next[option.name] === option.value),
    );
    if (nextVariant?.image) setActiveImage(nextVariant.image);
    else if (product?.featuredImage) setActiveImage(product.featuredImage);
  }

  async function submit(mode: "cart" | "buy") {
    if (!variant?.availableForSale) return;
    setAction(mode);
    setError("");
    try {
      const cartId = localStorage.getItem("shopify-cart-id");
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cartId, merchandiseId: variant.id, quantity }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Cart could not be updated");
      localStorage.setItem("shopify-cart-id", payload.cart.id);
      if (mode === "buy") {
        window.location.assign(payload.cart.checkoutUrl);
      } else {
        setAction("added");
        onClose();
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent("cart:updated", { detail: payload.cart }));
        }, 50);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Please try again");
      setAction("idle");
    }
  }

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={product ? `Quick view: ${product.title}` : "Product quick view"}
        className={styles.modal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className={styles.modalClose} onClick={onClose} aria-label="Close quick view">
          <X size={22} />
        </button>
        {loading ? (
          <div className={styles.modalState}><LoaderCircle className="animate-spin" /> Loading product…</div>
        ) : error && !product ? (
          <div className={styles.modalState}>{error}</div>
        ) : product ? (
          <div className={styles.quickLayout}>
            <div className={styles.gallery}>
              <div className={styles.mainImage}>
                {activeImage && (
                  <Image
                    src={activeImage.url}
                    alt={activeImage.altText || product.title}
                    fill
                    sizes="(min-width: 900px) 45vw, 100vw"
                    className={styles.coverImage}
                    priority
                  />
                )}
              </div>
              {product.images.nodes.length > 1 && (
                <div className={styles.thumbnails}>
                  {product.images.nodes.slice(0, 5).map((image) => (
                    <button
                      key={image.url}
                      className={activeImage?.url === image.url ? styles.thumbnailActive : styles.thumbnail}
                      onClick={() => setActiveImage(image)}
                    >
                      <Image src={image.url} alt={image.altText || "Product view"} fill sizes="90px" className={styles.coverImage} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.productInfo}>
              <p className={styles.eyebrow}>IVORY MUSE · SILK COLLECTION</p>
              <h2>{product.title}</h2>
              {product.description && <p className={styles.description}>{product.description}</p>}
              <div className={styles.priceRow}>
                <strong>{variant ? formatMoney(variant.price) : formatMoney(product.priceRange.minVariantPrice)}</strong>
                <span>per meter</span>
              </div>
              {(product.options || []).filter((option) => option.name !== "Title").map((option) => (
                <fieldset className={styles.optionGroup} key={option.id} aria-label={option.name}>
                  {!isColorOption(option.name) && <legend>{option.name}</legend>}
                  <div className={isColorOption(option.name) ? styles.swatchList : styles.optionList}>
                    {option.optionValues.map((value) => {
                      const active = selected[option.name] === value.name;
                      return isColorOption(option.name) ? (
                        <button
                          type="button"
                          key={value.id}
                          title={value.name}
                          aria-label={`${option.name}: ${value.name}`}
                          aria-pressed={active}
                          className={`${styles.swatchChoice} ${active ? styles.swatchSelected : ""}`}
                          onClick={() => selectOption(option.name, value.name)}
                        >
                          <span style={swatchStyle(value)} />
                          <small>{value.name}</small>
                        </button>
                      ) : (
                        <button
                          type="button"
                          key={value.id}
                          aria-pressed={active}
                          className={`${styles.optionButton} ${active ? styles.optionSelected : ""}`}
                          onClick={() => selectOption(option.name, value.name)}
                        >
                          {value.name}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              <div className={styles.quantityRow}>
                <span>Quantity</span>
                <div className={styles.quantityPicker}>
                  <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
                  <output>{quantity}</output>
                  <button onClick={() => setQuantity((value) => Math.min(20, value + 1))} aria-label="Increase quantity"><Plus size={14} /></button>
                </div>
                {variant && <strong>{formatMoney({ amount: String(Number(variant.price.amount) * quantity), currencyCode: variant.price.currencyCode })}</strong>}
              </div>
              {!variant && <p className={styles.error}>This option combination is unavailable.</p>}
              <div className={styles.actions}>
                <button onClick={() => submit("buy")} disabled={!variant?.availableForSale || action === "buy"} className={styles.buyButton}>
                  {action === "buy" ? "Redirecting…" : "Buy now"}
                </button>
                <button onClick={() => submit("cart")} disabled={!variant?.availableForSale || action === "cart"} className={styles.cartButton}>
                  {action === "cart" ? "Adding…" : action === "added" ? <><Check size={16} /> Added to cart</> : "Add to cart"}
                </button>
              </div>
              {!variant?.availableForSale && variant && <p className={styles.error}>This variant is currently sold out.</p>}
              {error && <p className={styles.error}>{error}</p>}
              {[product.composition, product.fabricWeight, product.fabricWidth, product.care].some(Boolean) && (
                <div className={styles.specifications}>
                  <h3>Fabric specifications</h3>
                  {product.composition && <div><span>Composition</span><strong>{product.composition.value}</strong></div>}
                  {product.fabricWeight && <div><span>Weight</span><strong>{product.fabricWeight.value}</strong></div>}
                  {product.fabricWidth && <div><span>Width</span><strong>{product.fabricWidth.value}</strong></div>}
                  {product.care && <div><span>Care</span><strong>{product.care.value}</strong></div>}
                </div>
              )}
              <Link className={styles.detailsLink} href={`/products/${product.handle}`}>View full product details</Link>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function CollectionProductGrid({ products }: { products: Product[] }) {
  const [quickView, setQuickView] = useState<string | null>(null);
  return (
    <>
      <div className={styles.grid}>
        {products.map((product) => {
          const colorOption = product.options?.find((option) => isColorOption(option.name));
          return (
            <article className={styles.card} key={product.id}>
              <div className={styles.imageWrap}>
                <Link href={`/products/${product.handle}`} aria-label={product.title}>
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      sizes="(min-width: 1200px) 25vw, (min-width: 700px) 50vw, 100vw"
                      className={styles.cardImage}
                    />
                  ) : <span className={styles.imagePlaceholder} />}
                </Link>
                <button className={styles.quickButton} onClick={() => setQuickView(product.handle)} aria-label={`Quick add ${product.title}`}>
                  <QuickCartIcon />
                </button>
              </div>
              <div className={styles.cardContent}>
                <h2><Link href={`/products/${product.handle}`}>{product.title}</Link></h2>
                {product.description && <p>{product.description}</p>}
                <strong>{formatMoney(product.priceRange.minVariantPrice)} <small>/ meter</small></strong>
                {colorOption && (
                  <div className={styles.cardSwatches} aria-label={`Available ${colorOption.name}`}>
                    {colorOption.optionValues.slice(0, 7).map((value) => (
                      <Link
                        key={value.id}
                        href={`/products/${product.handle}?${new URLSearchParams({ [colorOption.name]: value.name }).toString()}`}
                        title={`View ${product.title} in ${value.name}`}
                        aria-label={`${product.title}: select ${value.name}`}
                        style={swatchStyle(value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {quickView && <ProductQuickView handle={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}
