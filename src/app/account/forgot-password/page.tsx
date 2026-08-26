import { RecoverForm } from "../auth-form";
import styles from "../account.module.css";

export const metadata = { title: "Reset password | Ivory Muse" };

export default function ForgotPasswordPage() {
  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <div className={styles.authPanelInner}>
          <p className={styles.eyebrow}>Account recovery</p>
          <h1>Reset your password</h1>
          <p className={styles.authIntro}>Enter the email address used for your Ivory Muse account.</p>
          <RecoverForm />
        </div>
      </section>
    </main>
  );
}
