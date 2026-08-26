import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-account/session";
import styles from "../account.module.css";

export const metadata = { title: "Sign in | Ivory Muse" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCustomerSession()) redirect("/account");
  const { error } = await searchParams;
  return <main className={styles.shell}><div className={styles.authCard}><p className={styles.eyebrow}>Customer account</p><h1 className={styles.title}>Welcome back</h1><p className={styles.intro}>Sign in securely with the email connected to your Ivory Muse orders. Shopify will email you a one-time verification code.</p>{error && <p className={`${styles.notice} ${styles.error}`}>{error === "configuration" ? "Customer accounts need to be connected in Shopify before sign-in is available." : "We could not complete sign-in. Please try again."}</p>}<div className={styles.actions}><Link className={styles.primary} href="/api/customer-account/auth?returnTo=/account">Continue to sign in</Link><Link className={styles.secondary} href="/account/register">Create an account</Link></div></div></main>;
}
