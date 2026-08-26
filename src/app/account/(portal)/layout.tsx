import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-account/session";
import { getAccountContent } from "@/lib/customer-account/content";
import styles from "../account.module.css";
import { AccountNav } from "../account-nav";
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
    profileLabel: "Profile",
    supportLabel: "Support",
    signOutLabel: "Sign out",
    ...(await getAccountContent<Record<string, string>>("accountNavigation")),
  };
  return (
    <main className={styles.shell}>
      <div className={`${styles.inner} ${styles.portal}`}>
        <AccountNav labels={copy} />
        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
}
