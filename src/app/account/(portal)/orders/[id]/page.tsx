import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ExternalLink, MapPin, Package, Truck } from "lucide-react";
import { customerAccountFetch, decodeCustomerId } from "@/lib/customer-account/client";
import { ORDER_QUERY } from "@/lib/customer-account/queries";
import { getAccountContent } from "@/lib/customer-account/content";
import { formatMoney } from "@/lib/format";
import styles from "../../../account.module.css";

type Money = { amount: string; currencyCode: string };
type Address = { formatted: string[] };
type Item = { title: string; quantity: number; currentQuantity: number; originalTotalPrice: Money; discountedTotalPrice: Money; customAttributes: { key: string; value: string }[]; variant?: { id: string; title: string; sku?: string | null; image?: { url: string; altText?: string | null } | null; price: Money; product: { handle: string; title: string } } | null };
type Fulfillment = { trackingCompany?: string | null; trackingInfo: { number?: string | null; url?: string | null }[] };
type Order = { id: string; name: string; orderNumber: number; processedAt: string; canceledAt?: string | null; cancelReason?: string | null; email?: string | null; phone?: string | null; financialStatus: string; fulfillmentStatus: string; statusUrl: string; totalPrice: Money; subtotalPrice?: Money; totalShippingPrice: Money; totalTax?: Money; totalRefunded?: Money; shippingAddress?: Address | null; billingAddress?: Address | null; successfulFulfillments?: Fulfillment[] | null; lineItems: { nodes: Item[] } };
type Data = { customer: { orders: { nodes: Order[] } } };
const readable = (value: string) => value.replaceAll("_", " ").toLowerCase();
const hasMoney = (money?: Money) => Boolean(money && Number(money.amount) > 0);

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gid = decodeCustomerId(id);
  if (!gid.startsWith("gid://shopify/Order/")) notFound();
  const [{ customer }, cms] = await Promise.all([
    customerAccountFetch<Data>(ORDER_QUERY),
    getAccountContent<Record<string, string>>("accountOrderDetailsPage"),
  ]);
  const order = customer.orders.nodes.find((item) => item.id === gid);
  if (!order) notFound();
  const c = { backLabel: "Back to orders", eyebrow: "Order details", trackLabel: "View order status", itemsHeading: "Items in your order", quantityLabel: "Qty", skuLabel: "SKU", subtotalLabel: "Subtotal", shippingLabel: "Shipping", taxLabel: "Tax", refundedLabel: "Refunded", totalLabel: "Order total", progressHeading: "Order progress", placedLabel: "Order placed", paidLabel: "Payment confirmed", preparingLabel: "Preparing order", fulfilledLabel: "Fulfilled", trackingHeading: "Delivery & tracking", trackPackageLabel: "Track package", trackingPendingText: "Tracking details will appear here as soon as your order has shipped.", shippingAddressHeading: "Shipping address", billingAddressHeading: "Billing address", contactHeading: "Contact information", noAddressText: "No address was supplied.", cancelledLabel: "This order was cancelled", ...cms };
  const zero = { amount: "0", currencyCode: order.totalPrice.currencyCode };
  const isPaid = ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"].includes(order.financialStatus);
  const isFulfilled = order.fulfillmentStatus === "FULFILLED";
  const tracking = (order.successfulFulfillments || []).flatMap((fulfillment) => fulfillment.trackingInfo.map((info) => ({ ...info, company: fulfillment.trackingCompany })));
  const steps = [{ label: c.placedLabel, done: true }, { label: c.paidLabel, done: isPaid }, { label: c.preparingLabel, done: isPaid && !order.canceledAt }, { label: c.fulfilledLabel, done: isFulfilled }];

  return <>
    <Link className={styles.back} href="/account/orders">← {c.backLabel}</Link>
    <header className={`${styles.header} ${styles.orderDetailHeader}`}>
      <div><p className={styles.eyebrow}>{c.eyebrow}</p><h1 className={styles.title}>{order.name}</h1><p className={styles.muted}>{new Intl.DateTimeFormat("en-AU", { dateStyle: "long" }).format(new Date(order.processedAt))}</p></div>
      <div className={styles.orderDetailActions}><span className={styles.orderBadge}>{readable(order.financialStatus)}</span><span className={`${styles.orderBadge} ${order.canceledAt ? styles.orderBadgeDanger : ""}`}>{order.canceledAt ? "cancelled" : readable(order.fulfillmentStatus)}</span><a className={styles.secondary} href={order.statusUrl}>{c.trackLabel}<ExternalLink size={15} /></a></div>
    </header>
    {order.canceledAt && <div className={`${styles.notice} ${styles.error}`}><strong>{c.cancelledLabel}</strong>{order.cancelReason ? ` · ${readable(order.cancelReason)}` : ""}</div>}
    <section className={styles.orderProgressCard}><h2>{c.progressHeading}</h2><div className={styles.orderProgress}>{steps.map((step, index) => <div className={`${styles.progressStep} ${step.done ? styles.progressStepDone : ""}`} key={step.label}><span>{step.done ? <Check size={16} /> : index + 1}</span><p>{step.label}</p></div>)}</div></section>
    <div className={styles.orderDetailLayout}>
      <section className={styles.orderItemsCard}>
        <div className={styles.orderSectionTitle}><Package size={22} /><h2>{c.itemsHeading}</h2></div>
        {order.lineItems.nodes.map((item, index) => <article className={styles.orderProduct} key={`${item.variant?.id || item.title}-${index}`}>
          <div className={styles.orderProductImage}>{item.variant?.image ? <Image src={item.variant.image.url} alt={item.variant.image.altText || item.title} width={96} height={120} /> : <Package size={28} />}</div>
          <div className={styles.orderProductInfo}>{item.variant?.product?.handle ? <Link href={`/products/${item.variant.product.handle}`}><strong>{item.title}</strong></Link> : <strong>{item.title}</strong>}{item.variant?.title && item.variant.title !== "Default Title" && <span>{item.variant.title}</span>}{item.variant?.sku && <span>{c.skuLabel}: {item.variant.sku}</span>}<span>{c.quantityLabel}: {item.quantity}</span>{item.customAttributes.map((attribute) => <span key={attribute.key}>{attribute.key}: {attribute.value}</span>)}</div>
          <div className={styles.orderProductPrice}>{item.originalTotalPrice.amount !== item.discountedTotalPrice.amount && <del>{formatMoney(item.originalTotalPrice)}</del>}<strong>{formatMoney(item.discountedTotalPrice)}</strong></div>
        </article>)}
        <div className={styles.orderSummary}><div><span>{c.subtotalLabel}</span><span>{formatMoney(order.subtotalPrice || zero)}</span></div><div><span>{c.shippingLabel}</span><span>{formatMoney(order.totalShippingPrice || zero)}</span></div><div><span>{c.taxLabel}</span><span>{formatMoney(order.totalTax || zero)}</span></div>{hasMoney(order.totalRefunded) && <div><span>{c.refundedLabel}</span><span>−{formatMoney(order.totalRefunded!)}</span></div>}<div className={styles.orderGrandTotal}><strong>{c.totalLabel}</strong><strong>{formatMoney(order.totalPrice)}</strong></div></div>
      </section>
      <aside className={styles.orderDetailSidebar}>
        <section className={styles.orderInfoCard}><div className={styles.orderSectionTitle}><Truck size={22} /><h2>{c.trackingHeading}</h2></div>{tracking.length ? tracking.map((item, index) => <div className={styles.trackingItem} key={`${item.number}-${index}`}><span>{item.company || "Carrier"}</span>{item.number && <strong>{item.number}</strong>}{item.url && <a href={item.url}>{c.trackPackageLabel}<ExternalLink size={14} /></a>}</div>) : <p className={styles.muted}>{c.trackingPendingText}</p>}</section>
        <section className={styles.orderInfoCard}><h2>{c.contactHeading}</h2>{order.email && <p>{order.email}</p>}{order.phone && <p>{order.phone}</p>}</section>
      </aside>
    </div>
    <div className={styles.orderAddressGrid}>{[{ icon: <MapPin size={21} />, title: c.shippingAddressHeading, address: order.shippingAddress }, { icon: <MapPin size={21} />, title: c.billingAddressHeading, address: order.billingAddress }].map((entry) => <section className={styles.orderInfoCard} key={entry.title}><div className={styles.orderSectionTitle}>{entry.icon}<h2>{entry.title}</h2></div>{entry.address?.formatted?.length ? entry.address.formatted.map((line) => <p key={line}>{line}</p>) : <p className={styles.muted}>{c.noAddressText}</p>}</section>)}</div>
  </>;
}
