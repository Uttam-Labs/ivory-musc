import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-account/session";
import { storefrontCustomerFetch } from "@/lib/customer-account/client";
import { getAccountContent } from "@/lib/customer-account/content";
import styles from "../account.module.css";
import { AccountNav } from "../account-nav";
export default async function AccountPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");
  const identity = await storefrontCustomerFetch<{
    customer: { id: string } | null;
  }>(
    `query AccountIdentity($customerAccessToken:String!){customer(customerAccessToken:$customerAccessToken){id}}`,
    { customerAccessToken: session.accessToken },
  ).catch(() => undefined);
  if (identity && !identity.customer)
    redirect("/api/customer-account/logout?reason=expired");
  const copy = {
    ariaLabel: "Customer account",
    overviewLabel: "Overview",
    ordersLabel: "Orders",
    addressesLabel: "Addresses",
    profileLabel: "Profile",
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
