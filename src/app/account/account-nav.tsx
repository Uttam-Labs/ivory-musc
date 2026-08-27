"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./account.module.css";

type Labels = {
  ariaLabel: string;
  overviewLabel: string;
  ordersLabel: string;
  addressesLabel: string;
  profileLabel: string;
  signOutLabel: string;
};
const items = [
  { href: "/account", key: "overviewLabel", exact: true },
  { href: "/account/orders", key: "ordersLabel" },
  { href: "/account/addresses", key: "addressesLabel" },
  { href: "/account/profile", key: "profileLabel" },
] as const;

export function AccountNav({ labels }: { labels: Labels }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label={labels.ariaLabel}>
      {items.map((item) => {
        const active = "exact" in item
          ? pathname === "/account"
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? styles.navActive : undefined}
            aria-current={active ? "page" : undefined}
          >
            {labels[item.key]}
          </Link>
        );
      })}
      <Link className={styles.signOut} href="/api/customer-account/logout">
        {labels.signOutLabel}
      </Link>
    </nav>
  );
}
