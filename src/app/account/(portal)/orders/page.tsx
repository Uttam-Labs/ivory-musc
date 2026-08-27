import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { customerAccountFetch, encodeCustomerId } from "@/lib/customer-account/client";
import { ORDERS_FALLBACK_QUERY, ORDERS_QUERY } from "@/lib/customer-account/queries";
import { getAccountContent } from "@/lib/customer-account/content";
import { OrderList, type OrderListItem } from "./order-list";
import styles from "../../account.module.css";
type Data = { customer: { orders: { nodes: Omit<OrderListItem, "encodedId">[] } } | null };
export async function generateMetadata() {
  const content = await getAccountContent<Record<string, string>>("accountOrdersPage");
  return { title: content.seoTitle || "Orders | Ivory Muse" };
}
export default async function OrdersPage() {
  const [ordersResult, cms] = await Promise.all([
    customerAccountFetch<Data>(ORDERS_QUERY, { first: 50 }).catch(() =>
      customerAccountFetch<Data>(ORDERS_FALLBACK_QUERY, { first: 50 }).catch(
        () => null,
      ),
    ),
    getAccountContent<Record<string, string>>("accountOrdersPage"),
  ]);
  const customer = ordersResult?.customer;
  const c = {
    eyebrow: "Order history",
    heading: "Your orders",
    emptyKicker: "Ivory Muse collection",
    emptyHeading: "Your order history is waiting",
    emptyText:
      "When you place an order, its details and delivery progress will appear here.",
    shopLabel: "Start shopping",
    searchPlaceholder: "Search by order number or status",
    filterAll: "All orders",
    filterOpen: "Open orders",
    filterFulfilled: "Fulfilled",
    filterCancelled: "Cancelled",
    noResultsHeading: "No matching orders",
    noResultsText: "Try a different order number, status, or filter.",
    viewDetailsLabel: "View details",
    previousLabel: "Previous",
    nextLabel: "Next",
    errorHeading: "We couldn’t load your orders",
    errorText: "Your order history is temporarily unavailable. Please try again.",
    retryLabel: "Try again",
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
        {!customer ? (
          <div className={styles.orderEmptyState}>
            <span className={styles.orderEmptyIcon} aria-hidden="true">
              <ShoppingBag size={28} strokeWidth={1.35} />
            </span>
            <h2>{c.errorHeading}</h2>
            <p className={styles.orderEmptyText}>{c.errorText}</p>
            <a className={styles.orderEmptyAction} href="/account/orders">
              {c.retryLabel}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        ) : customer.orders.nodes.length ? (
          <OrderList orders={customer.orders.nodes.map((order) => ({ ...order, encodedId: encodeCustomerId(order.id) }))} copy={c} />
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
