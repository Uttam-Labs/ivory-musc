"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, LoaderCircle, Minus, Plus, Truck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CollectionProductGrid } from "@/components/collection-product-grid";
import { SiteContainer } from "@/components/site-container";
import { formatMoney } from "@/lib/format";
import type { Product, ProductOptionValue } from "@/lib/shopify/types";
import styles from "@/app/products/product-details.module.css";

const fallbackColors: Record<string, string> = { ivory: "#f7f3e8", champagne: "#dbcaa4", "blush rose": "#d8a6a0", "soft sand": "#d4bea0", onyx: "#28282b", black: "#28282b", white: "#fff", cream: "#f4ead2", gold: "#c7a35c" };
function isColor(name: string) { return /colou?r|shade|finish/i.test(name); }
function swatchStyle(value: ProductOptionValue) { const image = value.swatch?.image?.previewImage?.url; return image ? { backgroundImage: `url(${image})` } : { backgroundColor: value.swatch?.color || fallbackColors[value.name.toLowerCase()] || "#eee9e1" }; }

export type ProductDetailsSettings = {
  homeLabel?: string; homeHref?: string; collectionLabel?: string; collectionHref?: string; perUnitLabel?: string;
  quantityLabel?: string; totalLabel?: string; minimumPurchaseText?: string;
  buyNowLabel?: string; addToCartLabel?: string; purchaseSampleLabel?: string;
  purchaseSampleHref?: string; shippingText?: string; specificationsHeading?: string;
  compositionLabel?: string; weightLabel?: string; widthLabel?: string; careLabel?: string;
};

export function ProductDetails({ product, initialSelection, settings, relatedHeading, relatedProducts }: { product: Product; initialSelection: Record<string, string>; settings?: ProductDetailsSettings; relatedHeading?: string; relatedProducts: Product[] }) {
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
  const [action, setAction] = useState<"idle" | "cart" | "buy" | "added" | "error">("idle");
  const variant = useMemo(() => product.variants.nodes.find((item) => item.selectedOptions.every((option) => selected[option.name] === option.value)), [product.variants.nodes, selected]);
  const activeImage = manualImage ? product.images.nodes.find((image) => image.url === manualImage) || product.featuredImage : variant?.image || product.featuredImage;
  const price = variant?.price || product.priceRange.minVariantPrice;
  const total = { ...price, amount: String(Number(price.amount) * quantity) };
  const specifications = [[settings?.compositionLabel, product.composition?.value], [settings?.weightLabel, product.fabricWeight?.value], [settings?.widthLabel, product.fabricWidth?.value], [settings?.careLabel, product.care?.value]].filter((item): item is [string, string] => Boolean(item[0] && item[1]));

  function choose(name: string, value: string) {
    const requested = { ...selected, [name]: value };
    const match = product.variants.nodes.find((item) => item.selectedOptions.every((option) => requested[option.name] === option.value)) || product.variants.nodes.find((item) => item.selectedOptions.some((option) => option.name === name && option.value === value));
    const next = match ? Object.fromEntries(match.selectedOptions.map((option) => [option.name, option.value])) : requested;
    setSelected(next); setManualImage(null);
    router.replace(`${pathname}?${new URLSearchParams(next).toString()}`, { scroll: false });
  }

  async function submit(mode: "cart" | "buy") {
    if (!variant?.availableForSale) return;
    setAction(mode);
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cartId: localStorage.getItem("shopify-cart-id"), merchandiseId: variant.id, quantity }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Cart could not be updated");
      localStorage.setItem("shopify-cart-id", payload.cart.id);
      if (mode === "buy") window.location.assign(payload.cart.checkoutUrl);
      else { setAction("added"); window.dispatchEvent(new CustomEvent("cart:updated", { detail: payload.cart })); }
    } catch { setAction("error"); }
  }

  return <main className={styles.page}>
    <SiteContainer className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        {settings?.homeLabel && settings.homeHref && <Link href={settings.homeHref}>{settings.homeLabel}</Link>}
        {settings?.collectionLabel && settings.collectionHref && <><span>/</span><Link href={settings.collectionHref}>{settings.collectionLabel}</Link></>}
        <span>/</span><span>{product.title}</span>
      </nav>
      <section className={styles.productSection}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>{activeImage && <Image src={activeImage.url} alt={activeImage.altText || product.title} fill priority sizes="(min-width:768px) 50vw, 100vw" />}</div>
          {product.images.nodes.length > 1 && <div className={styles.thumbnails}>{product.images.nodes.map((image) => <button key={image.url} aria-label={`View ${image.altText || product.title}`} className={activeImage?.url === image.url ? styles.activeThumb : undefined} onClick={() => setManualImage(image.url)}><Image src={image.url} alt={image.altText || product.title} fill sizes="(min-width: 1200px) 12vw, (min-width: 768px) 20vw, 45vw" /></button>)}</div>}
        </div>
        <div className={styles.info}>
          {product.featuredTitle?.value && <p className={styles.eyebrow}>{product.featuredTitle.value}</p>}
          <h1>{product.title}</h1>
          {product.description && <p className={styles.description}>{product.description}</p>}
          <div className={styles.priceRow}>{variant?.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(price.amount) && <del>{formatMoney(variant.compareAtPrice)}</del>}<p className={styles.price}>{formatMoney(price)}</p>{settings?.perUnitLabel && <small>{settings.perUnitLabel}</small>}</div>
          {(product.options || []).filter((option) => option.name !== "Title").map((option) => <fieldset key={option.id} className={styles.options}>
            <legend>{option.name}</legend>
            <div className={isColor(option.name) ? styles.colorOptions : styles.optionList}>{option.optionValues.map((value) => isColor(option.name) ? <button key={value.id} type="button" title={value.name} aria-label={`${option.name}: ${value.name}`} aria-pressed={selected[option.name] === value.name} className={`${styles.swatch} ${selected[option.name] === value.name ? styles.selectedSwatch : ""}`} onClick={() => choose(option.name, value.name)}><span style={swatchStyle(value)} /><small>{value.name}</small></button> : <button key={value.id} type="button" aria-pressed={selected[option.name] === value.name} className={`${styles.optionButton} ${selected[option.name] === value.name ? styles.selectedOption : ""}`} onClick={() => choose(option.name, value.name)}>{value.name}</button>)}</div>
          </fieldset>)}
          <div className={styles.purchaseRow}>
            <div>{settings?.quantityLabel && <span className={styles.fieldLabel}>{settings.quantityLabel}</span>}<div className={styles.quantityPicker}><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><output>{quantity}</output><button onClick={() => setQuantity((value) => Math.min(20, value + 1))} aria-label="Increase quantity"><Plus size={15} /></button></div></div>
            <div className={styles.total}>{settings?.totalLabel && <span>{settings.totalLabel}</span>}<strong>{formatMoney(total)}</strong></div>
            {settings?.minimumPurchaseText && <p>{settings.minimumPurchaseText}</p>}
          </div>
          {!variant && <p className={styles.unavailable}>This combination is unavailable.</p>}
          <div className={styles.actions}>
            {settings?.buyNowLabel && <button className={styles.buyButton} onClick={() => submit("buy")} disabled={!variant?.availableForSale || action === "buy"}>{action === "buy" ? <LoaderCircle className="animate-spin" size={17} /> : settings.buyNowLabel}</button>}
            {settings?.addToCartLabel && <button className={styles.cartButton} onClick={() => submit("cart")} disabled={!variant?.availableForSale || action === "cart"}>{action === "cart" ? <LoaderCircle className="animate-spin" size={17} /> : action === "added" ? <><Check size={17} /> {settings.addToCartLabel}</> : settings.addToCartLabel}</button>}
            {settings?.purchaseSampleLabel && settings.purchaseSampleHref && <Link className={styles.sampleButton} href={settings.purchaseSampleHref}>{settings.purchaseSampleLabel}</Link>}
          </div>
          {action === "error" && <p className={styles.unavailable}>Please try again.</p>}
          {settings?.shippingText && <div className={styles.shipping}><Truck size={17} strokeWidth={1.5} /><span>{settings.shippingText}</span></div>}
          {specifications.length > 0 && <div className={styles.specifications}>{settings?.specificationsHeading && <h2>{settings.specificationsHeading}</h2>}{specifications.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
        </div>
      </section>
      {relatedProducts.length > 0 && <section className={styles.related}>{relatedHeading && <h2>{relatedHeading}</h2>}<CollectionProductGrid products={relatedProducts} /></section>}
    </SiteContainer>
  </main>;
}
