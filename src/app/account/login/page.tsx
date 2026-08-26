import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-account/session";
import { LoginForm } from "../auth-form";
import styles from "../account.module.css";

export const metadata = { title: "Sign in | Ivory Muse" };
export default async function LoginPage() {
  if (await getCustomerSession()) redirect("/account");
  return <main className={styles.authPage}><section className={styles.authVisual}><div><p className={styles.eyebrow}>The Ivory Muse collection</p><h1>Designed for those who value exceptional materials.</h1><p>Save addresses, review orders and enjoy a considered shopping experience.</p></div></section><section className={styles.authPanel}><div className={styles.authPanelInner}><p className={styles.eyebrow}>Customer account</p><h2>Welcome back</h2><p className={styles.muted}>Sign in to continue to your account.</p><LoginForm/></div></section></main>;
}
