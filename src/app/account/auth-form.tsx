"use client";
import Link from "next/link";
import { useActionState } from "react";
import {
  loginAction,
  recoverAction,
  registerAction,
  type AuthState,
} from "./auth-actions";
import type {
  LoginContent,
  RecoveryContent,
  RegisterContent,
} from "@/lib/customer-account/content";
import styles from "./account.module.css";
import { AccountFeedback } from "./account-feedback";
const initial: AuthState = {};
function Submit({ children }: { children: React.ReactNode }) {
  return (
    <button className={styles.primary} type="submit">
      {children}
    </button>
  );
}
export function LoginForm({ content }: { content: LoginContent }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className={styles.authForm}>
      <AccountFeedback
        key={state.error || "login-feedback"}
        error={state.error}
      />
      <Field
        name="email"
        label={content.emailLabel}
        type="email"
        autoComplete="email"
      />
      <Field
        name="password"
        label={content.passwordLabel}
        type="password"
        autoComplete="current-password"
      />
      <div className={styles.formMeta}>
        <label className={styles.check}>
          <input type="checkbox" name="remember" /> {content.rememberLabel}
        </label>
        <Link href="/account/forgot-password">
          {content.forgotPasswordLabel}
        </Link>
      </div>
      <Submit>{pending ? content.submittingLabel : content.submitLabel}</Submit>
      <p className={styles.switchText}>
        {content.newCustomerText}{" "}
        <Link href="/account/register">{content.registerLinkLabel}</Link>
      </p>
    </form>
  );
}
export function RegisterForm({ content }: { content: RegisterContent }) {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className={styles.authForm}>
      <AccountFeedback
        key={state.error || "register-feedback"}
        error={state.error}
      />
      <div className={styles.authGrid}>
        <Field
          name="firstName"
          label={content.firstNameLabel}
          autoComplete="given-name"
        />
        <Field
          name="lastName"
          label={content.lastNameLabel}
          autoComplete="family-name"
        />
      </div>
      <Field
        name="email"
        label={content.emailLabel}
        type="email"
        autoComplete="email"
      />
      <Field
        name="password"
        label={content.passwordLabel}
        type="password"
        autoComplete="new-password"
        hint={content.passwordHint}
      />
      <Field
        name="confirmPassword"
        label={content.confirmPasswordLabel}
        type="password"
        autoComplete="new-password"
      />
      <label className={styles.check}>
        <input type="checkbox" name="acceptsMarketing" />{" "}
        {content.marketingLabel}
      </label>
      <Submit>{pending ? content.submittingLabel : content.submitLabel}</Submit>
      <p className={styles.switchText}>
        {content.existingCustomerText}{" "}
        <Link href="/account/login">{content.loginLinkLabel}</Link>
      </p>
    </form>
  );
}
export function RecoverForm({ content }: { content: RecoveryContent }) {
  const [state, action, pending] = useActionState(recoverAction, initial);
  return (
    <form action={action} className={styles.authForm}>
      <AccountFeedback
        key={state.error || state.success || "recover-feedback"}
        error={state.error}
        success={state.success}
      />
      <Field
        name="email"
        label={content.emailLabel}
        type="email"
        autoComplete="email"
      />
      <Submit>{pending ? content.submittingLabel : content.submitLabel}</Submit>
      <p className={styles.switchText}>
        <Link href="/account/login">{content.backLabel}</Link>
      </p>
    </form>
  );
}
function Field({
  name,
  label,
  type = "text",
  autoComplete,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className={styles.authField}>
      <span>{label}</span>
      <input required name={name} type={type} autoComplete={autoComplete} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
