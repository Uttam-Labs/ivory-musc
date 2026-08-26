import { RegisterForm } from "../auth-form";
import styles from "../account.module.css";
export const metadata = { title: "Create account | Ivory Muse" };
export default function RegisterPage() { return <main className={styles.authPage}><section className={`${styles.authVisual} ${styles.registerVisual}`}><div><p className={styles.eyebrow}>Join Ivory Muse</p><h1>Your private place for beautiful silk.</h1><p>Create an account to keep every order and delivery detail together.</p></div></section><section className={styles.authPanel}><div className={styles.authPanelInner}><p className={styles.eyebrow}>New customer</p><h2>Create an account</h2><p className={styles.muted}>A few details are all we need.</p><RegisterForm/></div></section></main>; }
