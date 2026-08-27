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
  defaultAddress?: { countryCodeV2?: string };
};
type Data = { customer: Customer };
const phoneCountries = [
  { iso: "AU", name: "Australia", dial: "61" },
  { iso: "BD", name: "Bangladesh", dial: "880" },
  { iso: "IN", name: "India", dial: "91" },
  { iso: "NZ", name: "New Zealand", dial: "64" },
  { iso: "GB", name: "United Kingdom", dial: "44" },
  { iso: "US", name: "United States", dial: "1" },
  { iso: "CA", name: "Canada", dial: "1" },
  { iso: "SG", name: "Singapore", dial: "65" },
  { iso: "AE", name: "United Arab Emirates", dial: "971" },
  { iso: "PK", name: "Pakistan", dial: "92" },
  { iso: "LK", name: "Sri Lanka", dial: "94" },
  { iso: "NP", name: "Nepal", dial: "977" },
] as const;

function phoneDefaults(phone?: string, addressCountry?: string) {
  const digits = (phone || "").replace(/\D/g, "");
  const phoneMatches = phone?.startsWith("+")
    ? [...phoneCountries]
        .sort((a, b) => b.dial.length - a.dial.length)
        .filter((country) => digits.startsWith(country.dial))
    : [];
  const phoneCountry =
    phoneMatches.find((country) => country.iso === addressCountry) ||
    phoneMatches[0];
  const country =
    phoneCountry ||
    phoneCountries.find((item) => item.iso === addressCountry) ||
    phoneCountries[0];
  return {
    countryIso: country.iso,
    number:
      phoneCountry && digits.startsWith(phoneCountry.dial)
        ? digits.slice(phoneCountry.dial.length)
        : phone || "",
  };
}
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
    countryCodeLabel: "Country code",
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
  const phone = phoneDefaults(
    customer.phone,
    customer.defaultAddress?.countryCodeV2,
  );
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
            <PhoneField
              label={c.phoneLabel}
              countryCodeLabel={c.countryCodeLabel}
              countryIso={phone.countryIso}
              value={phone.number}
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
function PhoneField({
  label,
  countryCodeLabel,
  countryIso,
  value,
}: {
  label: string;
  countryCodeLabel: string;
  countryIso: string;
  value: string;
}) {
  return (
    <div className={`${styles.field} ${styles.full}`}>
      <label htmlFor="phone">{label}</label>
      <div className={styles.phoneField}>
        <select
          aria-label={countryCodeLabel}
          name="phoneCountry"
          defaultValue={countryIso}
        >
          {phoneCountries.map((country) => (
            <option key={country.iso} value={country.iso}>
              {country.name} (+{country.dial})
            </option>
          ))}
        </select>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          defaultValue={value}
        />
      </div>
    </div>
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
