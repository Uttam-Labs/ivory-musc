import Link from "next/link";
import styles from "./status-pages.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.inner}>
        <span className={styles.code} aria-hidden="true">404</span>
        <p className={styles.eyebrow}>A thread out of place</p>
        <h1 className={styles.title}>This page could not be found</h1>
        <p className={styles.copy}>
          The page may have moved or the link may no longer be available. Return
          home or continue exploring our curated silk collection.
        </p>
        <div className={styles.divider} aria-hidden="true"><span>IM</span></div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">Return home</Link>
          <Link className={styles.secondary} href="/collections/shop">Explore the collection</Link>
        </div>
      </section>
    </main>
  );
}
