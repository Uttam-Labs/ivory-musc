import Link from "next/link";
import styles from "./status-pages.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.inner}>
        <span className={styles.code} aria-hidden="true">404</span>
        <p className={styles.eyebrow}>Page not found</p>
        <h1 className={styles.title}>This page is unavailable</h1>
        <p className={styles.copy}>
          The page may have moved or no longer exists.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">Return home</Link>
          <Link className={styles.secondary} href="/collections/shop">Shop silks</Link>
        </div>
      </section>
    </main>
  );
}
