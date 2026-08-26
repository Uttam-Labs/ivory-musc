import { customerAccountFetch } from "@/lib/customer-account/client";
import { getAccountContent } from "@/lib/customer-account/content";
import { PROFILE_QUERY } from "@/lib/customer-account/queries";
import { updatePassword, updateProfile } from "../../profile-actions";
import styles from "../../account.module.css";
import { ConfirmSubmitButton } from "../../confirm-submit-button";
import { AccountFeedback } from "../../account-feedback";

type Customer = {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  acceptsMarketing: boolean;
};
type Data = { customer: Customer };
export async function generateMetadata() {
  const c =
    await getAccountContent<Record<string, string>>("accountProfilePage");
  return { title: c.seoTitle || "Profile | Ivory Muse" };
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const [{ customer }, params, cms] = await Promise.all([
    customerAccountFetch<Data>(PROFILE_QUERY),
    searchParams,
    getAccountContent<Record<string, string>>("accountProfilePage"),
  ]);
  const c = {
    eyebrow: "Personal details",
    heading: "Your profile",
    description:
      "Update the information associated with your customer account.",
    detailsHeading: "Contact information",
    securityHeading: "Password",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    emailLabel: "Email address",
    phoneLabel: "Phone",
    marketingLabel: "Receive news about collections and private offers",
    passwordLabel: "New password",
    confirmPasswordLabel: "Confirm new password",
    passwordHint:
      "Leave blank to keep your current password. Use at least 8 characters.",
    saveDetailsLabel: "Save details",
    savePasswordLabel: "Update password",
    confirmDetailsMessage: "Save these changes to your profile?",
    confirmPasswordMessage:
      "Update your account password? You will use the new password next time you sign in.",
    ...cms,
  };
  return (
    <>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 className={styles.title}>{c.heading}</h1>
          <p className={styles.portalIntro}>{c.description}</p>
        </div>
      </header>
      <AccountFeedback
        key={params.error || params.success || "feedback"}
        success={params.success}
        error={params.error}
        clearQuery
      />
      <div className={styles.profileStack}>
        <article className={styles.card}>
          <h2>{c.detailsHeading}</h2>
          <form className={styles.form} action={updateProfile}>
            <Field
              name="firstName"
              label={c.firstNameLabel}
              value={customer.firstName}
              required
            />
            <Field
              name="lastName"
              label={c.lastNameLabel}
              value={customer.lastName}
              required
            />
            <Field
              full
              name="email"
              type="email"
              label={c.emailLabel}
              value={customer.email}
              required
            />
            <Field
              full
              name="phone"
              type="tel"
              label={c.phoneLabel}
              value={customer.phone}
            />
            <label className={`${styles.check} ${styles.full}`}>
              <input
                type="checkbox"
                name="acceptsMarketing"
                defaultChecked={customer.acceptsMarketing}
              />{" "}
              {c.marketingLabel}
            </label>
            <ConfirmSubmitButton
              className={`${styles.primary} ${styles.full}`}
              message={c.confirmDetailsMessage}
            >
              {c.saveDetailsLabel}
            </ConfirmSubmitButton>
          </form>
        </article>
        <article className={styles.card}>
          <h2>{c.securityHeading}</h2>
          <form className={styles.form} action={updatePassword}>
            <Field
              full
              name="password"
              type="password"
              label={c.passwordLabel}
              required
              hint={c.passwordHint}
            />
            <Field
              full
              name="confirmPassword"
              type="password"
              label={c.confirmPasswordLabel}
              required
            />
            <ConfirmSubmitButton
              className={`${styles.primary} ${styles.full}`}
              message={c.confirmPasswordMessage}
              matchFields={["password", "confirmPassword"]}
            >
              {c.savePasswordLabel}
            </ConfirmSubmitButton>
          </form>
        </article>
      </div>
    </>
  );
}
function Field({
  name,
  label,
  value,
  type = "text",
  required,
  full,
  hint,
}: {
  name: string;
  label: string;
  value?: string;
  type?: string;
  required?: boolean;
  full?: boolean;
  hint?: string;
}) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value || ""}
        required={required}
      />
      {hint && <small>{hint}</small>}
    </div>
  );
}
