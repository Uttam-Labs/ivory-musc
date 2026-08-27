"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <div className={styles.mobileNavBar}>
        <button
          type="button"
          aria-label="Open account settings"
          aria-expanded={open}
          aria-controls="account-navigation"
          onClick={() => setOpen(true)}
        >
          <span className={styles.mobileNavLabel}>
            <strong>Account menu</strong>
            <small>Overview, orders &amp; profile</small>
          </span>
          <span className={styles.mobileNavIcon} aria-hidden="true">
            <Settings size={19} strokeWidth={1.7} />
          </span>
        </button>
      </div>
      <button
        type="button"
        className={`${styles.navBackdrop} ${open ? styles.navBackdropOpen : ""}`}
        aria-label="Close account settings"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />
      <nav
        id="account-navigation"
        className={`${styles.nav} ${open ? styles.navOpen : ""}`}
        aria-label={labels.ariaLabel}
      >
        <div className={styles.mobileNavHeading}>
          <div>
            <small>Customer account</small>
            <strong>Settings</strong>
          </div>
          <button type="button" aria-label="Close account settings" onClick={() => setOpen(false)}>
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>
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
              onClick={() => setOpen(false)}
            >
              {labels[item.key]}
            </Link>
          );
        })}
        <form action="/api/customer-account/logout" method="post">
          <button className={styles.signOut} type="submit">
            {labels.signOutLabel}
          </button>
        </form>
      </nav>
    </>
  );
}
