import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-account/session";
import { getAccountContent } from "@/lib/customer-account/content";
import styles from "../account.module.css";
export default async function AccountPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getCustomerSession())) redirect("/account/login");
  const copy = {
    ariaLabel: "Customer account",
    overviewLabel: "Overview",
    ordersLabel: "Orders",
    addressesLabel: "Addresses",
    signOutLabel: "Sign out",
    ...(await getAccountContent<Record<string, string>>("accountNavigation")),
  };
  return (
    <main className={styles.shell}>
      <div className={`${styles.inner} ${styles.portal}`}>
        <nav className={styles.nav} aria-label={copy.ariaLabel}>
          <Link href="/account">{copy.overviewLabel}</Link>
          <Link href="/account/orders">{copy.ordersLabel}</Link>
          <Link href="/account/addresses">{copy.addressesLabel}</Link>
          <Link href="/api/customer-account/logout">{copy.signOutLabel}</Link>
        </nav>
        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
}
