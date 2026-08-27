import type { Metadata } from "next";
import Link from "next/link";
import styles from "../status-pages.module.css";

export const metadata: Metadata = {
  title: "Silk Guide — Coming Soon",
  description:
    "The Ivory Muse guide to silk, craftsmanship and considered care is coming soon.",
};

export default function SilkGuidePage() {
  return (
    <main className={styles.page}>
      <section className={styles.inner}>
        <p className={styles.eyebrow}>Ivory Muse</p>
        <h1 className={styles.title}>Silk Guide — Coming Soon</h1>
        <p className={styles.copy}>
          Our guide to silk qualities, care and craftsmanship is coming soon.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/collections/shop">Explore our silks</Link>
          <Link className={styles.secondary} href="/">Return home</Link>
        </div>
      </section>
    </main>
  );
}
