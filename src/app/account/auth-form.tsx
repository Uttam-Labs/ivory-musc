"use client";
import Link from "next/link";
import { Info } from "lucide-react";
import { useActionState, useState } from "react";
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
const initial: AuthState = {};
function Submit({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending: boolean;
}) {
  return (
    <button className={styles.primary} type="submit" disabled={pending}>
      {children}
    </button>
  );
}
export function LoginForm({ content }: { content: LoginContent }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className={styles.authForm} noValidate>
      <Field
        name="email"
        label={content.emailLabel}
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <Field
        name="password"
        label={content.passwordLabel}
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
      />
      <InlineFeedback error={state.error} />
      <div className={styles.formMeta}>
        <label className={styles.check}>
          <input type="checkbox" name="remember" /> {content.rememberLabel}
        </label>
        <Link href="/account/forgot-password">
          {content.forgotPasswordLabel}
        </Link>
      </div>
      <Submit pending={pending}>
        {pending ? content.submittingLabel : content.submitLabel}
      </Submit>
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
    <form action={action} className={styles.authForm} noValidate>
      <div className={styles.authGrid}>
        <Field
          name="firstName"
          label={content.firstNameLabel}
          autoComplete="given-name"
          error={state.fieldErrors?.firstName}
        />
        <Field
          name="lastName"
          label={content.lastNameLabel}
          autoComplete="family-name"
          error={state.fieldErrors?.lastName}
        />
      </div>
      <Field
        name="email"
        label={content.emailLabel}
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <PasswordStrengthField
        content={content}
        error={state.fieldErrors?.password}
      />
      <Field
        name="confirmPassword"
        label={content.confirmPasswordLabel}
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
      />
      <InlineFeedback error={state.error} />
      <label className={styles.check}>
        <input type="checkbox" name="acceptsMarketing" />{" "}
        {content.marketingLabel}
      </label>
      <Submit pending={pending}>
        {pending ? content.submittingLabel : content.submitLabel}
      </Submit>
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
    <form action={action} className={styles.authForm} noValidate>
      <Field
        name="email"
        label={content.emailLabel}
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <InlineFeedback error={state.error} success={state.success} />
      <Submit pending={pending}>
        {pending ? content.submittingLabel : content.submitLabel}
      </Submit>
      <p className={styles.switchText}>
        <Link href="/account/login">{content.backLabel}</Link>
      </p>
    </form>
  );
}
function InlineFeedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const message = error || success;
  if (!message) return null;
  return (
    <p
      className={`${styles.authFeedback} ${error ? styles.authFeedbackError : styles.authFeedbackSuccess}`}
      role={error ? "alert" : "status"}
      aria-live="polite"
    >
      <span aria-hidden="true">{error ? "!" : "✓"}</span>
      {message}
    </p>
  );
}
function PasswordStrengthField({
  content,
  error,
}: {
  content: RegisterContent;
  error?: string;
}) {
  const [password, setPassword] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = [
    "",
    content.strengthWeak,
    content.strengthFair,
    content.strengthGood,
    content.strengthStrong,
  ];
  const requirements = [
    content.requirementLength,
    content.requirementCase,
    content.requirementNumber,
    content.requirementSymbol,
  ];
  return (
    <div className={styles.authField}>
      <label htmlFor="register-password">{content.passwordLabel}</label>
      <input
        id="register-password"
        required
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-describedby={error ? "password-strength password-error" : "password-strength"}
        aria-invalid={Boolean(error)}
        className={error ? styles.invalidInput : undefined}
      />
      {error && <FieldError id="password-error" message={error} />}
      <div
        id="password-strength"
        className={styles.passwordStrength}
        data-score={password ? score : 0}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setTooltipOpen(false);
        }}
      >
        <div className={styles.strengthBarRow}>
          <div className={styles.strengthTrack} aria-hidden="true">
            <span
              style={{ width: `${password ? Math.max(1, score) * 25 : 0}%` }}
            />
          </div>
          <button
            type="button"
            className={styles.strengthInfo}
            aria-label={`${content.passwordStrengthLabel}: ${password ? labels[Math.max(1, score)] : content.passwordHint}`}
            aria-expanded={tooltipOpen}
            onClick={() => setTooltipOpen((open) => !open)}
          >
            <Info size={16} aria-hidden="true" />
          </button>
        </div>
        <div
          className={`${styles.strengthTooltip} ${tooltipOpen ? styles.strengthTooltipOpen : ""}`}
          role="tooltip"
        >
          <div className={styles.strengthHeading}>
            <small>{content.passwordStrengthLabel}</small>
            <strong aria-live="polite">
              {password ? labels[Math.max(1, score)] : content.passwordHint}
            </strong>
          </div>
          <ul>
            {requirements.map((requirement, index) => (
              <li
                className={checks[index] ? styles.requirementMet : undefined}
                key={requirement}
              >
                <span aria-hidden="true">{checks[index] ? "✓" : "○"}</span>
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
function Field({
  name,
  label,
  type = "text",
  autoComplete,
  hint,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <label className={styles.authField}>
      <span>{label}</span>
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={error ? styles.invalidInput : undefined}
      />
      {error && <FieldError id={`${name}-error`} message={error} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function FieldError({ message, id }: { message: string; id?: string }) {
  return (
    <small className={styles.fieldError} id={id} role="alert">
      <span aria-hidden="true">!</span>
      {message}
    </small>
  );
}
