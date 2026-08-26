import Link from "next/link";
import {
  customerAccountFetch,
  encodeCustomerId,
} from "@/lib/customer-account/client";
import { ACCOUNT_QUERY } from "@/lib/customer-account/queries";
import { formatMoney } from "@/lib/format";
import { getAccountContent } from "@/lib/customer-account/content";
import styles from "../account.module.css";
type Money = { amount: string; currencyCode: string };
type Address = { formatted: string[] };
type Order = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: Money;
};
type Data = {
  customer: {
    displayName: string;
    email?: string;
    defaultAddress?: Address;
    orders: { nodes: Order[] };
  };
};
export async function generateMetadata() {
  const content = await getAccountContent<Record<string, string>>("accountDashboardPage");
  return { title: content.seoTitle || "My account | Ivory Muse" };
}
export default async function AccountPage() {
  const [{ customer }, cms] = await Promise.all([
    customerAccountFetch<Data>(ACCOUNT_QUERY),
    getAccountContent<Record<string, string>>("accountDashboardPage"),
  ]);
  const c = {
    eyebrow: "My account",
    greetingPrefix: "Hello",
    addressHeading: "Default address",
    noAddressText: "No address saved yet.",
    manageAddressesLabel: "Manage addresses",
    ordersHeading: "Recent orders",
    noOrdersText: "You have not placed an order yet.",
    viewOrdersLabel: "View all orders",
    ...cms,
  };
  return (
    <>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 className={styles.title}>
            {c.greetingPrefix}, {customer.displayName}
          </h1>
          <p className={styles.muted}>{customer.email}</p>
        </div>
      </header>
      <div className={styles.grid}>
        <article className={styles.card}>
          <h2>{c.addressHeading}</h2>
          {customer.defaultAddress ? (
            customer.defaultAddress.formatted.map((line) => (
              <p key={line}>{line}</p>
            ))
          ) : (
            <p className={styles.muted}>{c.noAddressText}</p>
          )}
          <Link className={styles.back} href="/account/addresses">
            {c.manageAddressesLabel}
          </Link>
        </article>
        <article className={styles.card}>
          <h2>{c.ordersHeading}</h2>
          {customer.orders.nodes.length ? (
            customer.orders.nodes.map((order) => (
              <p key={order.id}>
                <Link href={`/account/orders/${encodeCustomerId(order.id)}`}>
                  {order.name}
                </Link>{" "}
                · {formatMoney(order.totalPrice)}
              </p>
            ))
          ) : (
            <p className={styles.muted}>{c.noOrdersText}</p>
          )}
          <Link className={styles.back} href="/account/orders">
            {c.viewOrdersLabel}
          </Link>
        </article>
      </div>
    </>
  );
}
