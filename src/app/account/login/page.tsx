import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-account/session";
import { LoginForm } from "../auth-form";
import styles from "../account.module.css";

export const metadata = { title: "Sign in | Ivory Muse" };
export default async function LoginPage() {
  if (await getCustomerSession()) redirect("/account");
  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <div className={styles.authPanelInner}>
          <p className={styles.eyebrow}>Customer account</p>
          <h1>Welcome back</h1>
          <p className={styles.authIntro}>Sign in to review your orders, manage addresses and continue your Ivory Muse experience.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
