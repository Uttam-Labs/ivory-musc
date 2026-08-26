import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  customerAccountFetch,
  decodeCustomerId,
} from "@/lib/customer-account/client";
import { ORDER_QUERY } from "@/lib/customer-account/queries";
import { getAccountContent } from "@/lib/customer-account/content";
import { formatMoney } from "@/lib/format";
import styles from "../../../account.module.css";
type Money = { amount: string; currencyCode: string };
type Address = { formatted: string[] };
type Item = {
  id: string;
  title: string;
  quantity: number;
  image?: { url: string; altText?: string };
  price?: Money;
  totalPrice?: Money;
};
type Order = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  statusUrl: string;
  totalPrice: Money;
  subtotalPrice?: Money;
  totalShippingPrice: Money;
  totalTax?: Money;
  shippingAddress?: Address;
  billingAddress?: Address;
  lineItems: { nodes: Item[] };
};
type Data = { customer: { orders: { nodes: Order[] } } };
export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gid = decodeCustomerId(id);
  if (!gid.startsWith("gid://shopify/Order/")) notFound();
  const [{ customer }, cms] = await Promise.all([
    customerAccountFetch<Data>(ORDER_QUERY),
    getAccountContent<Record<string, string>>("accountOrderDetailsPage"),
  ]);
  const order = customer.orders.nodes.find((item) => item.id === gid);
  if (!order) notFound();
  const c = {
    backLabel: "Back to orders",
    eyebrow: "Order details",
    trackLabel: "Track order",
    quantityLabel: "Quantity",
    eachLabel: "each",
    subtotalLabel: "Subtotal",
    shippingLabel: "Shipping",
    taxLabel: "Tax",
    totalLabel: "Total",
    shippingAddressHeading: "Shipping address",
    billingAddressHeading: "Billing address",
    ...cms,
  };
  const zero = { amount: "0", currencyCode: order.totalPrice.currencyCode };
  return (
    <>
      <Link className={styles.back} href="/account/orders">
        ← {c.backLabel}
      </Link>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 className={styles.title}>{order.name}</h1>
          <p className={styles.muted}>
            {new Intl.DateTimeFormat("en-AU", { dateStyle: "long" }).format(
              new Date(order.processedAt),
            )}{" "}
            · {order.fulfillmentStatus.replaceAll("_", " ")}
          </p>
        </div>
        <a className={styles.secondary} href={order.statusUrl}>
          {c.trackLabel}
        </a>
      </header>
      <div className={styles.card}>
        {order.lineItems.nodes.map((item) => (
          <div className={styles.lineItem} key={item.id}>
            {item.image ? (
              <Image
                src={item.image.url}
                alt={item.image.altText || item.title}
                width={80}
                height={100}
              />
            ) : (
              <span />
            )}
            <div>
              <strong>{item.title}</strong>
              <p className={styles.muted}>
                {c.quantityLabel}: {item.quantity}
                {item.price
                  ? ` · ${formatMoney(item.price)} ${c.eachLabel}`
                  : ""}
              </p>
            </div>
            <strong>{formatMoney(item.totalPrice || zero)}</strong>
          </div>
        ))}
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>{c.subtotalLabel}</span>
            <span>{formatMoney(order.subtotalPrice || zero)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>{c.shippingLabel}</span>
            <span>{formatMoney(order.totalShippingPrice)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>{c.taxLabel}</span>
            <span>{formatMoney(order.totalTax || zero)}</span>
          </div>
          <div className={styles.summaryRow}>
            <strong>{c.totalLabel}</strong>
            <strong>{formatMoney(order.totalPrice)}</strong>
          </div>
        </div>
      </div>
      <div className={`${styles.grid} mt-5`}>
        <article className={styles.card}>
          <h2>{c.shippingAddressHeading}</h2>
          {order.shippingAddress?.formatted.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </article>
        <article className={styles.card}>
          <h2>{c.billingAddressHeading}</h2>
          {order.billingAddress?.formatted.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </article>
      </div>
    </>
  );
}
