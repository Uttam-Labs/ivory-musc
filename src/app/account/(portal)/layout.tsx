import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-account/session";
import styles from "../account.module.css";
export default async function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  if (!(await getCustomerSession())) redirect("/account/login");
  return <main className={styles.shell}><div className={`${styles.inner} ${styles.portal}`}><nav className={styles.nav} aria-label="Customer account"><Link href="/account">Overview</Link><Link href="/account/orders">Orders</Link><Link href="/account/addresses">Addresses</Link><Link href="/api/customer-account/logout">Sign out</Link></nav><section className={styles.content}>{children}</section></div></main>;
}
