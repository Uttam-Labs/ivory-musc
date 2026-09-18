import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-account/session";
import { LoginForm } from "../auth-form";
import { getAccountContent, type LoginContent } from "@/lib/customer-account/content";
import styles from "../account.module.css";
import { customerAccountApiEnabled } from "@/lib/customer-account/oauth";

const fallback: LoginContent = { seoTitle:"Sign in | Ivory Muse", eyebrow:"Customer account", heading:"Welcome back", description:"Sign in to review your orders, manage addresses and continue your Ivory Muse experience.", emailLabel:"Email address", passwordLabel:"Password", rememberLabel:"Remember me", forgotPasswordLabel:"Forgot password?", submitLabel:"Sign in", submittingLabel:"Signing in…", newCustomerText:"New to Ivory Muse?", registerLinkLabel:"Create an account" };
export async function generateMetadata(){const content=await getAccountContent<LoginContent>("accountLoginPage");return{title:content.seoTitle||fallback.seoTitle}}
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; error?: string }>;
}) {
  if (await getCustomerSession()) redirect("/account");
  const params = await searchParams;
  if (customerAccountApiEnabled() && !params.error) redirect("/api/customer-account/login?next=/account");
  const content = { ...fallback, ...await getAccountContent<LoginContent>("accountLoginPage") };
  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <div className={`${styles.authPanelInner} ${styles.loginPanel}`}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1>{content.heading}</h1>
          <p className={styles.authIntro}>{content.description}</p>
          {params.session === "expired" && (
            <p
              className={`${styles.authFeedback} ${styles.authFeedbackSuccess}`}
              role="status"
            >
              <span aria-hidden="true">i</span>
              Your secure session has expired. Please sign in again.
            </p>
          )}
          {customerAccountApiEnabled() ? (
            <>
              <p className={styles.authFeedback} role="alert">Shopify sign-in could not be completed. Please try again.</p>
              <Link className={styles.primary} href="/api/customer-account/login?next=/account">Try Shopify sign in again</Link>
            </>
          ) : <LoginForm content={content} />}
        </div>
      </section>
    </main>
  );
}
