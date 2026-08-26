import { RegisterForm } from "../auth-form";
import styles from "../account.module.css";
export const metadata = { title: "Create account | Ivory Muse" };
export default function RegisterPage() {
  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <div className={`${styles.authPanelInner} ${styles.registerPanel}`}>
          <p className={styles.eyebrow}>New customer</p>
          <h1>Create an account</h1>
          <p className={styles.authIntro}>Keep your orders, delivery details and favourite pieces together in one considered space.</p>
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
