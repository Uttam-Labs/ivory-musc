import { RecoverForm } from "../auth-form";
import { getAccountContent, type RecoveryContent } from "@/lib/customer-account/content";
import styles from "../account.module.css";

const fallback:RecoveryContent={seoTitle:"Reset password | Ivory Muse",eyebrow:"Account recovery",heading:"Reset your password",description:"Enter the email address used for your Ivory Muse account.",emailLabel:"Email address",submitLabel:"Send reset instructions",submittingLabel:"Sending…",backLabel:"Back to sign in"};
export async function generateMetadata(){const content=await getAccountContent<RecoveryContent>("accountRecoveryPage");return{title:content.seoTitle||fallback.seoTitle}}

export default async function ForgotPasswordPage() {
  const content={...fallback,...await getAccountContent<RecoveryContent>("accountRecoveryPage")};
  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <div className={styles.authPanelInner}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1>{content.heading}</h1>
          <p className={styles.authIntro}>{content.description}</p>
          <RecoverForm content={content} />
        </div>
      </section>
    </main>
  );
}
