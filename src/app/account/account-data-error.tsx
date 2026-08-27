import { RefreshCw } from "lucide-react";
import styles from "./account.module.css";

export function AccountDataError({
  title = "We couldn’t load this page",
  message = "Your account information is temporarily unavailable. Please try again.",
  href,
}: {
  title?: string;
  message?: string;
  href: string;
}) {
  return (
    <div className={styles.orderEmptyState} role="alert">
      <span className={styles.orderEmptyIcon} aria-hidden="true">
        <RefreshCw size={27} strokeWidth={1.35} />
      </span>
      <h2>{title}</h2>
      <p className={styles.orderEmptyText}>{message}</p>
      <a className={styles.orderEmptyAction} href={href}>
        Try again
        <RefreshCw size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
