import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-account/session";
import { LoginForm } from "../auth-form";
import { getAccountContent, type LoginContent } from "@/lib/customer-account/content";
import styles from "../account.module.css";

const fallback: LoginContent = { seoTitle:"Sign in | Ivory Muse", eyebrow:"Customer account", heading:"Welcome back", description:"Sign in to review your orders, manage addresses and continue your Ivory Muse experience.", emailLabel:"Email address", passwordLabel:"Password", rememberLabel:"Remember me", forgotPasswordLabel:"Forgot password?", submitLabel:"Sign in", submittingLabel:"Signing in…", newCustomerText:"New to Ivory Muse?", registerLinkLabel:"Create an account" };
export async function generateMetadata(){const content=await getAccountContent<LoginContent>("accountLoginPage");return{title:content.seoTitle||fallback.seoTitle}}
export default async function LoginPage() {
  if (await getCustomerSession()) redirect("/account");
  const content = { ...fallback, ...await getAccountContent<LoginContent>("accountLoginPage") };
  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <div className={`${styles.authPanelInner} ${styles.loginPanel}`}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1>{content.heading}</h1>
          <p className={styles.authIntro}>{content.description}</p>
          <LoginForm content={content} />
        </div>
      </section>
    </main>
  );
}
