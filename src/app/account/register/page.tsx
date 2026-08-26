import Link from "next/link";
import styles from "../account.module.css";
export const metadata = { title: "Create account | Ivory Muse" };
export default function RegisterPage() { return <main className={styles.shell}><div className={styles.authCard}><p className={styles.eyebrow}>New customer</p><h1 className={styles.title}>Create your account</h1><p className={styles.intro}>Enter your email on Shopify’s secure account screen. If the email is new, Shopify creates your account automatically—no password to remember.</p><div className={styles.actions}><Link className={styles.primary} href="/api/customer-account/auth?returnTo=/account">Continue to register</Link><Link className={styles.secondary} href="/account/login">Already have an account?</Link></div></div></main>; }
