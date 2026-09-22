"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, LoaderCircle, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProductDetailsSettings } from "@/components/product-details";
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

export type ProductGridContent = {
  eyebrow?: string; perUnitLabel?: string; quantityLabel?: string; unavailableText?: string;
  buyNowLabel?: string; buyLoadingLabel?: string; addToCartLabel?: string; addingLabel?: string;
  addedLabel?: string; soldOutText?: string; specificationsHeading?: string; compositionLabel?: string;
  weightLabel?: string; widthLabel?: string; careLabel?: string; detailsLabel?: string; loadingProductLabel?: string;
  quickViewLabel?: string; closeQuickViewLabel?: string; decreaseQuantityLabel?: string;
  increaseQuantityLabel?: string; productImageAlt?: string; actionErrorText?: string;
};
const fallbackContent: Required<ProductGridContent> = {
  eyebrow: "IVORY MUSE · SILK COLLECTION", perUnitLabel: "per metre", quantityLabel: "Quantity",
  unavailableText: "This option combination is unavailable.", buyNowLabel: "Buy now", buyLoadingLabel: "Redirecting…",
  addToCartLabel: "Add to cart", addingLabel: "Adding…", addedLabel: "Added to cart",
  soldOutText: "This variant is currently sold out.", specificationsHeading: "Fabric specifications",
  compositionLabel: "Composition", weightLabel: "Weight", widthLabel: "Width", careLabel: "Care",
  detailsLabel: "View full product details", loadingProductLabel: "Loading product…",
  quickViewLabel: "Quick view", closeQuickViewLabel: "Close quick view", decreaseQuantityLabel: "Decrease quantity",
  increaseQuantityLabel: "Increase quantity", productImageAlt: "Product view", actionErrorText: "Please try again",
};

function metafieldText(metafield?: Product["specialTag"]) {
  if (!metafield?.value) return "";
  if (metafield.type !== "rich_text_field") return metafield.value;
  try {
    const root = JSON.parse(metafield.value) as {
      children?: Array<{ children?: Array<{ value?: string }> }>;
    };
    return (
      root.children
        ?.flatMap(
          (paragraph) =>
            paragraph.children?.map((child) => child.value || "") || [],
        )
        .join(" ")
        .trim() || ""
    );
  } catch {
    return "";
  }
}

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

function isWidthOption(name: string) {
  return /width/i.test(name);
}

function formatWidth(value?: string) {
  if (!value) return value;
  if (/55\s*["″]/i.test(value)) return "140 CM";
  return value.replace(/\bcm\b/gi, "CM");
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
  content,
}: {
  handle: string;
  onClose: () => void;
  content?: ProductGridContent;
}) {
  const copy = { ...fallbackContent, ...content };
  const [product, setProduct] = useState<Product | null>(null);
  const [sampleProduct, setSampleProduct] = useState<Product | null>(null);
  const [detailsSettings, setDetailsSettings] = useState<ProductDetailsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState<"idle" | "cart" | "buy" | "added">("idle");
  const [sampleAction, setSampleAction] = useState<"idle" | "loading" | "error">("idle");
  const submitting = useRef(false);
  const [activeImage, setActiveImage] = useState<ShopifyImage | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products/${encodeURIComponent(handle)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Product could not be loaded");
        const nextProduct = payload.product as Product;
        setSampleProduct((payload.sampleProduct as Product | null) || null);
        setDetailsSettings((payload.settings as ProductDetailsSettings | null) || null);
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

  const selectedColor = variant?.selectedOptions.find((option) => isColorOption(option.name));
  const selectedVariantLabel = variant
    ? [
        ...variant.selectedOptions.filter((option) => isColorOption(option.name)),
        ...variant.selectedOptions.filter(
          (option) =>
            option.name !== "Title" &&
            !isColorOption(option.name) &&
            !isWidthOption(option.name),
        ),
      ]
        .map((option) => option.value)
        .join(" and ")
    : "";
  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [
      product.featuredImage,
      ...product.images.nodes,
      ...product.variants.nodes.map((item) => item.image),
    ]
      .filter(
        (image, index, all): image is ShopifyImage =>
          Boolean(image) &&
          all.findIndex((candidate) => candidate?.url === image?.url) === index,
      )
      .slice(0, 4);
  }, [product]);
  const thumbnailImages = galleryImages
    .filter((image) => image.url !== activeImage?.url)
    .slice(0, 3);
  const sampleVariant = sampleProduct?.variants.nodes.find((item) => item.availableForSale);
  const sampleSizeText = detailsSettings?.sampleSizeText || "Sample size is 10cm x 15cm";
  const sampleShippingNote =
    detailsSettings?.sampleShippingNote || "$3 AUD per sample, excluding shipping";
  const sampleNoteParts = sampleShippingNote.trim().split(/\s+/);

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
    if (!variant?.availableForSale || submitting.current) return;
    submitting.current = true;
    setAction(mode);
    setError("");
    try {
      const cartId = localStorage.getItem("shopify-cart-id");
      const selectedWidth = variant.selectedOptions.find((option) =>
        isWidthOption(option.name),
      )?.value;
      const attributes = [
        ...(selectedColor ? [{ key: "Colour", value: selectedColor.value }] : []),
        ...((selectedWidth || product?.fabricWidth?.value)
          ? [{ key: "Width", value: formatWidth(selectedWidth || product?.fabricWidth?.value) || "" }]
          : []),
        ...(product?.composition?.value
          ? [{ key: "Composition", value: product.composition.value }]
          : []),
      ];
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cartId,
          merchandiseId: variant.id,
          quantity,
          attributes: attributes.length ? attributes : undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Cart could not be updated");
      localStorage.setItem("shopify-cart-id", payload.cart.id);
      if (mode === "buy") {
        const checkoutResponse = await fetch("/api/cart/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cartId: payload.cart.id }),
        });
        const checkout = await checkoutResponse.json();
        if (!checkoutResponse.ok || !checkout.checkoutUrl) throw new Error(checkout.error || "Checkout could not be started");
        localStorage.setItem("shopify-checkout-cart-id", payload.cart.id);
        window.location.assign(checkout.checkoutUrl);
      } else {
        setAction("added");
        onClose();
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent("cart:updated", { detail: payload.cart }));
        }, 50);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.actionErrorText);
      setAction("idle");
    } finally {
      submitting.current = false;
    }
  }

  async function purchaseSample() {
    if (!product || !sampleVariant || sampleAction === "loading") return;
    setSampleAction("loading");
    try {
      const selectedOptions = variant?.selectedOptions || [];
      const selectedColorOption = selectedOptions.find((option) =>
        isColorOption(option.name),
      );
      const selectedWidth = selectedOptions.find((option) =>
        isWidthOption(option.name),
      )?.value;
      const selectedVariantAttributes = selectedOptions
        .filter(
          (option) =>
            option.name !== "Title" &&
            !isColorOption(option.name) &&
            !isWidthOption(option.name),
        )
        .slice(0, 4)
        .map((option) => ({ key: option.name, value: option.value }));
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cartId: localStorage.getItem("shopify-cart-id"),
          merchandiseId: sampleVariant.id,
          quantity: 1,
          attributes: [
            { key: "_type", value: "sample" },
            { key: "Main Product", value: product.title },
            ...(selectedColorOption
              ? [{ key: "Colour", value: selectedColorOption.value }]
              : []),
            ...((selectedWidth || product.fabricWidth?.value)
              ? [{ key: "Width", value: formatWidth(selectedWidth || product.fabricWidth?.value) || "" }]
              : []),
            ...(product.composition?.value
              ? [{ key: "Composition", value: product.composition.value }]
              : []),
            ...selectedVariantAttributes,
          ],
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Sample could not be added");
      localStorage.setItem("shopify-cart-id", payload.cart.id);
      setSampleAction("idle");
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: payload.cart }));
    } catch {
      setSampleAction("error");
    }
  }

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={product ? `${copy.quickViewLabel}: ${product.title}` : copy.quickViewLabel}
        className={styles.modal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className={styles.modalClose} onClick={onClose} aria-label={copy.closeQuickViewLabel}>
          <X size={22} />
        </button>
        {loading ? (
          <div className={styles.modalState}><LoaderCircle className="animate-spin" /> {copy.loadingProductLabel}</div>
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
                    quality={95}
                    sizes="(min-width: 900px) 45vw, 100vw"
                    className={styles.coverImage}
                    priority
                  />
                )}
              </div>
              {thumbnailImages.length > 0 && (
                <div className={styles.thumbnails}>
                  {thumbnailImages.map((image) => (
                    <button
                      key={image.url}
                      className={activeImage?.url === image.url ? styles.thumbnailActive : styles.thumbnail}
                      onClick={() => setActiveImage(image)}
                    >
                      <Image src={image.url} alt={image.altText || copy.productImageAlt} fill quality={95} sizes="90px" className={styles.coverImage} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.productInfo}>
              <p className={styles.eyebrow}>{copy.eyebrow}</p>
              <h2>{product.title.toLocaleUpperCase("en-AU")}</h2>
              {product.descriptionHtml ? (
                <div
                  className={styles.description}
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : product.description ? (
                <p className={styles.description}>{product.description}</p>
              ) : null}
              <div className={styles.priceRow}>
                <strong>{variant ? formatMoney(variant.price) : formatMoney(product.priceRange.minVariantPrice)}</strong>
                <span>{copy.perUnitLabel}</span>
              </div>
              {selectedVariantLabel && (
                <div className={styles.selectionSummary} aria-live="polite">
                  <span>{detailsSettings?.selectedLabel || "Selected"}:</span>
                  <strong>{selectedVariantLabel}</strong>
                </div>
              )}
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
                <span>{copy.quantityLabel}</span>
                <div className={styles.quantityPicker}>
                  <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label={copy.decreaseQuantityLabel}><Minus size={14} /></button>
                  <output>{quantity}</output>
                  <button onClick={() => setQuantity((value) => Math.min(20, value + 1))} aria-label={copy.increaseQuantityLabel}><Plus size={14} /></button>
                </div>
                {variant && <strong>{formatMoney({ amount: String(Number(variant.price.amount) * quantity), currencyCode: variant.price.currencyCode })}</strong>}
              </div>
              {!variant && <p className={styles.error}>{copy.unavailableText}</p>}
              <div className={`${styles.actions} ${sampleProduct ? "" : styles.actionsWithoutSample}`}>
                <button onClick={() => submit("buy")} disabled={!variant?.availableForSale || action === "buy" || action === "cart"} className={styles.buyButton}>
                  {action === "buy" ? copy.buyLoadingLabel : copy.buyNowLabel}
                </button>
                <button onClick={() => submit("cart")} disabled={!variant?.availableForSale || action === "cart" || action === "buy"} className={styles.cartButton}>
                  {action === "cart" ? copy.addingLabel : action === "added" ? <><Check size={16} /> {copy.addedLabel}</> : copy.addToCartLabel}
                </button>
                {sampleProduct && (
                  <button
                    type="button"
                    className={styles.sampleButton}
                    onClick={purchaseSample}
                    disabled={!sampleVariant || sampleAction === "loading"}
                  >
                    {sampleAction === "loading" ? (
                      <LoaderCircle className="animate-spin" size={17} />
                    ) : (
                      detailsSettings?.purchaseSampleLabel || "Purchase sample"
                    )}
                  </button>
                )}
              </div>
              {!variant?.availableForSale && variant && <p className={styles.error}>{copy.soldOutText}</p>}
              {error && <p className={styles.error}>{error}</p>}
              {sampleAction === "error" && (
                <p className={styles.error}>
                  {detailsSettings?.sampleErrorText ||
                    "This sample is already in your cart, or the 10-sample limit has been reached."}
                </p>
              )}
              {sampleProduct && (
                <div className={styles.sampleInformation}>
                  <h3>{detailsSettings?.sampleDetailsHeading || "Sample details"}</h3>
                  <p>{sampleSizeText}</p>
                  <p>
                    <strong>{sampleNoteParts.slice(0, 2).join(" ")}</strong>
                    {sampleNoteParts.length > 2
                      ? ` ${sampleNoteParts.slice(2).join(" ")}`
                      : ""}
                  </p>
                </div>
              )}
              {[product.composition, product.fabricWeight, product.fabricWidth, product.care].some(Boolean) && (
                <div className={styles.specifications}>
                  <h3>{copy.specificationsHeading}</h3>
                  {product.composition && <div><span>{copy.compositionLabel}</span><strong>{product.composition.value}</strong></div>}
                  {product.fabricWeight && <div><span>{copy.weightLabel}</span><strong>{product.fabricWeight.value}</strong></div>}
                  {product.fabricWidth && <div><span>{copy.widthLabel}</span><strong>{product.fabricWidth.value}</strong></div>}
                  {product.care && <div><span>{copy.careLabel}</span><strong>{product.care.value}</strong></div>}
                </div>
              )}
              <Link className={styles.detailsLink} href={`/products/${product.handle}`}>{copy.detailsLabel}</Link>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function CollectionProductGrid({ products, content }: { products: Product[]; content?: ProductGridContent }) {
  const copy = { ...fallbackContent, ...content };
  const [quickView, setQuickView] = useState<string | null>(null);
  return (
    <>
      <div className={styles.grid}>
        {products.map((product) => {
          const specialTag = metafieldText(product.specialTag);
          return (
            <article className={styles.card} key={product.id}>
              <div className={styles.imageWrap}>
                <Link href={`/products/${product.handle}`} aria-label={product.title}>
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      quality={95}
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
                <h2><Link href={`/products/${product.handle}`}>{product.title.toLocaleUpperCase("en-AU")}</Link></h2>
                {specialTag && <p>{specialTag}</p>}
                <strong>{formatMoney(product.priceRange.minVariantPrice)} <small>{copy.perUnitLabel}</small></strong>
              </div>
            </article>
          );
        })}
      </div>
      {quickView && <ProductQuickView handle={quickView} onClose={() => setQuickView(null)} content={content} />}
    </>
  );
}
