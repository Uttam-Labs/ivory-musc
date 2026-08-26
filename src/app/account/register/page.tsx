import { RegisterForm } from "../auth-form";
import {
  getAccountContent,
  type RegisterContent,
} from "@/lib/customer-account/content";
import styles from "../account.module.css";
const fallback: RegisterContent = {
  seoTitle: "Create account | Ivory Muse",
  eyebrow: "New customer",
  heading: "Create an account",
  description:
    "Keep your orders, delivery details and favourite pieces together in one considered space.",
  firstNameLabel: "First name",
  lastNameLabel: "Last name",
  emailLabel: "Email address",
  passwordLabel: "Password",
  passwordHint: "Use a secure password for your account",
  confirmPasswordLabel: "Confirm password",
  passwordStrengthLabel: "Password strength",
  strengthWeak: "Weak",
  strengthFair: "Fair",
  strengthGood: "Good",
  strengthStrong: "Strong",
  requirementLength: "8+ characters",
  requirementCase: "Upper & lowercase",
  requirementNumber: "One number",
  requirementSymbol: "One symbol",
  marketingLabel: "Email me about new collections and private offers",
  submitLabel: "Create account",
  submittingLabel: "Creating account…",
  existingCustomerText: "Already registered?",
  loginLinkLabel: "Sign in",
};
export async function generateMetadata() {
  const content = await getAccountContent<RegisterContent>(
    "accountRegisterPage",
  );
  return { title: content.seoTitle || fallback.seoTitle };
}
export default async function RegisterPage() {
  const content = {
    ...fallback,
    ...(await getAccountContent<RegisterContent>("accountRegisterPage")),
  };
  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <div className={`${styles.authPanelInner} ${styles.registerPanel}`}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1>{content.heading}</h1>
          <p className={styles.authIntro}>{content.description}</p>
          <RegisterForm content={content} />
        </div>
      </section>
    </main>
  );
}
