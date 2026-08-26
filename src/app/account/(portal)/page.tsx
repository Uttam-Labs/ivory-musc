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
    addresses: { nodes: Address[] };
    orders: { nodes: Order[] };
  };
};
export async function generateMetadata() {
  const content = await getAccountContent<Record<string, string>>(
    "accountDashboardPage",
  );
  return { title: content.seoTitle || "My account | Ivory Muse" };
}
export default async function AccountPage() {
  const [{ customer }, cms] = await Promise.all([
    customerAccountFetch<Data>(ACCOUNT_QUERY),
    getAccountContent<Record<string, string>>("accountDashboardPage"),
  ]);
  const c = {
    eyebrow: "My account",
    greetingPrefix: "Welcome back",
    intro: "Manage your orders, addresses and personal details in one place.",
    addressHeading: "Default address",
    noAddressText: "No address saved yet.",
    manageAddressesLabel: "Manage addresses",
    ordersHeading: "Recent orders",
    noOrdersText: "You have not placed an order yet.",
    viewOrdersLabel: "View all orders",
    profileCardTitle: "Personal details",
    profileCardText: "Keep your contact information and password up to date.",
    profileCardLabel: "Manage profile",
    supportCardTitle: "Need assistance?",
    supportCardText:
      "Our customer care team is here to help with orders and products.",
    supportCardLabel: "Contact us",
    shopLabel: "Continue shopping",
    ...cms,
  };
  return (
    <>
      <header className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 className={styles.title}>
            {c.greetingPrefix}, {customer.displayName}
          </h1>
          <p className={styles.portalIntro}>{c.intro}</p>
        </div>
        <Link className={styles.secondary} href="/collections">
          {c.shopLabel}
        </Link>
      </header>
      <div className={styles.dashboardGrid}>
        <article className={styles.dashboardCard}>
          <span className={styles.cardNumber}>
            {customer.orders.nodes.length}
          </span>
          <h2>{c.ordersHeading}</h2>
          <p className={styles.muted}>
            {customer.orders.nodes.length
              ? `${customer.orders.nodes.length} recent order${customer.orders.nodes.length === 1 ? "" : "s"}`
              : c.noOrdersText}
          </p>
          <Link className={styles.cardLink} href="/account/orders">
            {c.viewOrdersLabel} →
          </Link>
        </article>
        <article className={styles.dashboardCard}>
          <span className={styles.cardNumber}>
            {customer.addresses.nodes.length}
          </span>
          <h2>{c.addressHeading}</h2>
          {customer.defaultAddress ? (
            customer.defaultAddress.formatted.map((line) => (
              <p key={line}>{line}</p>
            ))
          ) : (
            <p className={styles.muted}>{c.noAddressText}</p>
          )}
          <Link className={styles.cardLink} href="/account/addresses">
            {c.manageAddressesLabel} →
          </Link>
        </article>
        <article className={styles.dashboardCard}>
          <span className={styles.cardKicker}>{customer.email}</span>
          <h2>{c.profileCardTitle}</h2>
          <p className={styles.muted}>{c.profileCardText}</p>
          <Link className={styles.cardLink} href="/account/profile">
            {c.profileCardLabel} →
          </Link>
        </article>
        <article className={styles.dashboardCard}>
          <span className={styles.cardKicker}>IVORY MUSE CARE</span>
          <h2>{c.supportCardTitle}</h2>
          <p className={styles.muted}>{c.supportCardText}</p>
          <Link className={styles.cardLink} href="/contact">
            {c.supportCardLabel} →
          </Link>
        </article>
      </div>
      {customer.orders.nodes.length > 0 && (
        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2>{c.ordersHeading}</h2>
            <Link href="/account/orders">{c.viewOrdersLabel}</Link>
          </div>
          {customer.orders.nodes.slice(0, 3).map((order) => (
            <Link
              className={styles.recentOrder}
              href={`/account/orders/${encodeCustomerId(order.id)}`}
              key={order.id}
            >
              <div>
                <strong>{order.name}</strong>
                <span>
                  {new Intl.DateTimeFormat("en-AU", {
                    dateStyle: "medium",
                  }).format(new Date(order.processedAt))}
                </span>
              </div>
              <span className={styles.status}>
                {order.fulfillmentStatus.replaceAll("_", " ")}
              </span>
              <strong>{formatMoney(order.totalPrice)}</strong>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
