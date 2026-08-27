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
        <p className={styles.eyebrow}>The Ivory Muse journal</p>
        <h1 className={styles.title}>Silk Guide<br />Coming Soon</h1>
        <p className={styles.copy}>
          We are thoughtfully creating a guide to silk qualities, finishes,
          care and craftsmanship—designed to help you choose and preserve each
          piece with confidence.
        </p>
        <div className={styles.divider} aria-hidden="true"><span>IM</span></div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/collections/shop">Explore our silks</Link>
          <Link className={styles.secondary} href="/">Return home</Link>
        </div>
        <p className={styles.note}>A considered resource is being woven.</p>
      </section>
    </main>
  );
}
