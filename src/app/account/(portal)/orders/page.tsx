import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import {
  customerAccountFetch,
  encodeCustomerId,
} from "@/lib/customer-account/client";
import { ORDERS_QUERY } from "@/lib/customer-account/queries";
import { formatMoney } from "@/lib/format";
import { getAccountContent } from "@/lib/customer-account/content";
import styles from "../../account.module.css";
type Order = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
};
type Data = { customer: { orders: { nodes: Order[] } } };
export async function generateMetadata() {
  const content = await getAccountContent<Record<string, string>>("accountOrdersPage");
  return { title: content.seoTitle || "Orders | Ivory Muse" };
}
export default async function OrdersPage() {
  const [{ customer }, cms] = await Promise.all([
    customerAccountFetch<Data>(ORDERS_QUERY, { first: 50 }),
    getAccountContent<Record<string, string>>("accountOrdersPage"),
  ]);
  const c = {
    eyebrow: "Order history",
    heading: "Your orders",
    emptyKicker: "Ivory Muse collection",
    emptyHeading: "Your order history is waiting",
    emptyText:
      "When you place an order, its details and delivery progress will appear here.",
    shopLabel: "Start shopping",
    ...cms,
  };
  return (
    <>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 className={styles.title}>{c.heading}</h1>
        </div>
      </header>
      <div className={styles.orderList}>
        {customer.orders.nodes.length ? (
          customer.orders.nodes.map((order) => (
            <Link
              className={styles.order}
              href={`/account/orders/${encodeCustomerId(order.id)}`}
              key={order.id}
            >
              <strong>{order.name}</strong>
              <span>
                {new Intl.DateTimeFormat("en-AU", {
                  dateStyle: "medium",
                }).format(new Date(order.processedAt))}
              </span>
              <span className={styles.status}>
                {order.fulfillmentStatus.replaceAll("_", " ")}
              </span>
              <span>{formatMoney(order.totalPrice)}</span>
            </Link>
          ))
        ) : (
          <div className={styles.orderEmptyState}>
            <span className={styles.orderEmptyIcon} aria-hidden="true">
              <ShoppingBag size={28} strokeWidth={1.35} />
            </span>
            <p className={styles.orderEmptyKicker}>{c.emptyKicker}</p>
            <h2>{c.emptyHeading}</h2>
            <p className={styles.orderEmptyText}>{c.emptyText}</p>
            <Link className={styles.orderEmptyAction} href="/collections/shop">
              {c.shopLabel}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
