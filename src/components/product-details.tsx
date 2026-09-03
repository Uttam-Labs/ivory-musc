"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, LoaderCircle, Minus, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { CollectionProductGrid } from "@/components/collection-product-grid";
import { SiteContainer } from "@/components/site-container";
import { formatMoney } from "@/lib/format";
import { SHOP_HREF } from "@/lib/navigation";
import type { Product, ProductOptionValue } from "@/lib/shopify/types";
import styles from "@/app/products/product-details.module.css";

const fallbackColors: Record<string, string> = { ivory: "#f7f3e8", champagne: "#dbcaa4", "blush rose": "#d8a6a0", "soft sand": "#d4bea0", onyx: "#28282b", black: "#28282b", white: "#fff", cream: "#f4ead2", gold: "#c7a35c" };
function isColor(name: string) { return /colou?r|shade|finish/i.test(name); }
function swatchStyle(value: ProductOptionValue) { const image = value.swatch?.image?.previewImage?.url; return image ? { backgroundImage: `url(${image})` } : { backgroundColor: value.swatch?.color || fallbackColors[value.name.toLowerCase()] || "#eee9e1" }; }
function formatWidth(value?: string) {
  if (!value) return value;
  if (/55\s*["″]/i.test(value)) return "140 CM";
  return value.replace(/\bcm\b/gi, "CM");
}

export type ProductDetailsSettings = {
  homeLabel?: string; homeHref?: string; collectionLabel?: string; collectionHref?: string; perUnitLabel?: string;
  quantityLabel?: string; totalLabel?: string; minimumPurchaseText?: string;
  buyNowLabel?: string; addToCartLabel?: string; purchaseSampleLabel?: string;
  sampleProductHandle?: string;
  purchaseSampleHref?: string; shippingText?: string; specificationsHeading?: string;
  compositionLabel?: string; weightLabel?: string; widthLabel?: string; careLabel?: string;
  sampleDetailsHeading?: string; sampleSizeText?: string; sampleShippingNote?: string;
  sampleStandardShippingText?: string; sampleExpressShippingText?: string;
};

export function ProductDetails({ product, sampleProduct, initialSelection, settings, relatedHeading, relatedProducts }: { product: Product; sampleProduct: Product | null; initialSelection: Record<string, string>; settings?: ProductDetailsSettings; relatedHeading?: string; relatedProducts: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = product.variants.nodes.find((item) => item.availableForSale) || product.variants.nodes[0];
    const base = Object.fromEntries((first?.selectedOptions || []).map((option) => [option.name, option.value]));
    const requestedVariant = product.variants.nodes.find((variant) => Object.entries(initialSelection).every(([name, value]) => variant.selectedOptions.some((option) => option.name === name && option.value === value)));
    return requestedVariant ? Object.fromEntries(requestedVariant.selectedOptions.map((option) => [option.name, option.value])) : base;
  });
  const [manualImage, setManualImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sampleAction, setSampleAction] = useState<"idle" | "loading" | "error">("idle");
  const [action, setAction] = useState<"idle" | "cart" | "buy" | "added" | "error">("idle");
  const submitting = useRef(false);
  const variant = useMemo(() => product.variants.nodes.find((item) => item.selectedOptions.every((option) => selected[option.name] === option.value)), [product.variants.nodes, selected]);
  const activeImage = manualImage ? product.images.nodes.find((image) => image.url === manualImage) || product.featuredImage : variant?.image || product.featuredImage;
  const price = variant?.price || product.priceRange.minVariantPrice;
  const total = { ...price, amount: String(Number(price.amount) * quantity) };
  const specifications = [[settings?.compositionLabel, product.composition?.value], [settings?.weightLabel, product.fabricWeight?.value], [settings?.widthLabel, formatWidth(product.fabricWidth?.value)], [settings?.careLabel, product.care?.value]].filter((item): item is [string, string] => Boolean(item[0] && item[1]));
  const sampleVariant = sampleProduct?.variants.nodes.find((item) => item.availableForSale);
  const breadcrumbItems = [
    settings?.homeLabel?.trim() ? { label: settings.homeLabel.trim(), href: settings.homeHref?.trim() || "/" } : null,
    settings?.collectionLabel?.trim() ? { label: settings.collectionLabel.trim(), href: SHOP_HREF } : null,
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  function choose(name: string, value: string) {
    const requested = { ...selected, [name]: value };
    const match = product.variants.nodes.find((item) => item.selectedOptions.every((option) => requested[option.name] === option.value)) || product.variants.nodes.find((item) => item.selectedOptions.some((option) => option.name === name && option.value === value));
    const next = match ? Object.fromEntries(match.selectedOptions.map((option) => [option.name, option.value])) : requested;
    setSelected(next); setManualImage(null);
    router.replace(`${pathname}?${new URLSearchParams(next).toString()}`, { scroll: false });
  }

  async function submit(mode: "cart" | "buy") {
    if (!variant?.availableForSale || submitting.current) return;
    submitting.current = true;
    setAction(mode);
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cartId: localStorage.getItem("shopify-cart-id"), merchandiseId: variant.id, quantity }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Cart could not be updated");
      localStorage.setItem("shopify-cart-id", payload.cart.id);
      if (mode === "buy") {
        const checkoutResponse = await fetch("/api/cart/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cartId: payload.cart.id }) });
        const checkout = await checkoutResponse.json();
        if (!checkoutResponse.ok || !checkout.checkoutUrl) throw new Error(checkout.error || "Checkout could not be started");
        localStorage.setItem("shopify-checkout-cart-id", payload.cart.id);
        window.location.assign(checkout.checkoutUrl);
      }
      else { setAction("added"); window.dispatchEvent(new CustomEvent("cart:updated", { detail: payload.cart })); }
    } catch { setAction("error"); }
    finally { submitting.current = false; }
  }

  async function purchaseSample() {
    if (!sampleVariant || sampleAction === "loading") return;
    setSampleAction("loading");
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cartId: localStorage.getItem("shopify-cart-id"), merchandiseId: sampleVariant.id, quantity: 1, attributes: [{ key: "type", value: "sample" }, { key: "Main Product", value: product.title }] }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Sample could not be added");
      localStorage.setItem("shopify-cart-id", payload.cart.id);
      setSampleAction("idle");
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: payload.cart }));
    } catch { setSampleAction("error"); }
  }

  return <main className={styles.page}>
    <SiteContainer className={`${styles.container} product__details`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        {breadcrumbItems.map((item, index) => <span key={`${item.href}-${item.label}`} className={styles.breadcrumbItem}>{index > 0 && <span aria-hidden="true">/</span>}<Link href={item.href}>{item.label}</Link></span>)}
        {breadcrumbItems.length > 0 && <span aria-hidden="true">/</span>}
        <span aria-current="page">{product.title}</span>
      </nav>
      <section className={`${styles.productSection} product-info-details__columns`}>
        <div className={`${styles.gallery} product-info-details__gallery`}>
          <div className={styles.mainImage}>{activeImage && <Image src={activeImage.url} alt={activeImage.altText || product.title} fill preload quality={95} sizes="(min-width:768px) 50vw, 100vw" />}</div>
          {product.images.nodes.length > 1 && <div className={`${styles.thumbnails} product-details__thumbnails`}>{product.images.nodes.slice(0, 2).map((image) => <button key={image.url} aria-label={`View ${image.altText || product.title}`} className={activeImage?.url === image.url ? styles.activeThumb : undefined} onClick={() => setManualImage(image.url)}><Image src={image.url} alt={image.altText || product.title} fill quality={95} sizes="(min-width: 1200px) 12vw, (min-width: 768px) 20vw, 45vw" /></button>)}</div>}
        </div>
        <div className={`${styles.info} product-info-details__wrapper`}>
          <div className="product--info__container">
          {product.featuredTitle?.value && <p className={`${styles.eyebrow} product-eyebrow`}>{product.featuredTitle.value}</p>}
          <h1 className="product__title">{product.title}</h1>
          {product.description && <p className={`${styles.description} product-description`}>{product.description}</p>}
          <div className={`${styles.priceRow} product-details__price-row`}>{variant?.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(price.amount) && <del>{formatMoney(variant.compareAtPrice)}</del>}<p className={`${styles.price} product-details__price`}>{formatMoney(price)}</p>{settings?.perUnitLabel && <small className="label-unit">{settings.perUnitLabel}</small>}</div>
          {(product.options || []).filter((option) => option.name !== "Title").map((option) => <fieldset key={option.id} aria-label={option.name} className={`${styles.options} product-details__options`}>
            {!isColor(option.name) && <legend className="option-label">{option.name}</legend>}
            <div className={isColor(option.name) ? styles.colorOptions : styles.optionList}>{option.optionValues.map((value) => isColor(option.name) ? <button key={value.id} type="button" title={value.name} aria-label={`${option.name}: ${value.name}`} aria-pressed={selected[option.name] === value.name} className={`${styles.swatch} ${selected[option.name] === value.name ? styles.selectedSwatch : ""}`} onClick={() => choose(option.name, value.name)}><span style={swatchStyle(value)} /><small>{value.name}</small></button> : <button key={value.id} type="button" aria-pressed={selected[option.name] === value.name} className={`${styles.optionButton} ${selected[option.name] === value.name ? styles.selectedOption : ""}`} onClick={() => choose(option.name, value.name)}>{value.name}</button>)}</div>
          </fieldset>)}
          <div className={`${styles.purchaseRow} product-details__purchase-row`}>
            <div className="product-details__options">{settings?.quantityLabel && <span className={`${styles.fieldLabel} option-label`}>{settings.quantityLabel}</span>}<div className={`${styles.quantityPicker} product-details__quantity`}><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><output>{quantity}</output><button onClick={() => setQuantity((value) => Math.min(20, value + 1))} aria-label="Increase quantity"><Plus size={15} /></button></div></div>
            <div className={`${styles.total} product-details__total`}>{settings?.totalLabel && <span>{settings.totalLabel}</span>}<strong>{formatMoney(total)}</strong></div>
            {settings?.minimumPurchaseText && <p>{settings.minimumPurchaseText}</p>}
          </div>
          {!variant && <p className={styles.unavailable}>This combination is unavailable.</p>}
          <div className={`${styles.actions} ${sampleProduct ? "" : styles.actionsWithoutSample} product-details__actions`}>
            {settings?.buyNowLabel && <button className={`${styles.buyButton} button buy-button`} onClick={() => submit("buy")} disabled={!variant?.availableForSale || action === "buy" || action === "cart"}>{action === "buy" ? <LoaderCircle className="animate-spin" size={17} /> : settings.buyNowLabel}</button>}
            {settings?.addToCartLabel && <button className={`${styles.cartButton} button button-add-to-cart`} onClick={() => submit("cart")} disabled={!variant?.availableForSale || action === "cart" || action === "buy"}>{action === "cart" ? <LoaderCircle className="animate-spin" size={17} /> : action === "added" ? <><Check size={17} /> {settings.addToCartLabel}</> : settings.addToCartLabel}</button>}
            {sampleProduct && <button type="button" className={`${styles.sampleButton} button button-sample`} onClick={purchaseSample} disabled={!sampleVariant || sampleAction === "loading"}>{sampleAction === "loading" ? <LoaderCircle className="animate-spin" size={17} /> : settings?.purchaseSampleLabel || "Purchase sample"}</button>}
          </div>
          {action === "error" && <p className={styles.unavailable}>Please try again.</p>}
          {sampleAction === "error" && <p className={styles.unavailable}>This sample is already in your cart, or the 10-sample limit has been reached.</p>}
          {sampleProduct && <div className={styles.sampleInformation}>
            <h2>{settings?.sampleDetailsHeading || "Sample details"}</h2>
            <p><strong>{formatMoney(sampleVariant?.price || sampleProduct.priceRange.minVariantPrice)}</strong> {settings?.sampleShippingNote || "per sample, excluding shipping"}</p>
            <p>{settings?.sampleSizeText || "Sample size: 10 CM × 15 CM"}</p>
            <p>{settings?.sampleStandardShippingText || "Standard sample shipping: $7 · 2–6 business days"}</p>
            <p>{settings?.sampleExpressShippingText || "Express sample shipping: $13 · 1–3 business days"}</p>
          </div>}
          {specifications.length > 0 && <div className={`${styles.specifications} product-details__specifications`}>{settings?.specificationsHeading && <h2>{settings.specificationsHeading}</h2>}{specifications.map(([label, value]) => <div className="spec" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
        </div>
        </div>
      </section>
      {relatedProducts.length > 0 && <section className={styles.related}>{relatedHeading && <h2 className="common-heading">{relatedHeading}</h2>}<div className={styles.relatedGrid}><CollectionProductGrid products={relatedProducts} /></div></section>}
    </SiteContainer>
  </main>;
}
