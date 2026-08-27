"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { storefrontCustomerFetch } from "@/lib/customer-account/client";
import {
  CUSTOMER_SESSION_COOKIE,
  customerCookieOptions,
  encryptSession,
} from "@/lib/customer-account/session";

export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type TokenPayload = {
  customerAccessTokenCreate: {
    customerAccessToken?: { accessToken: string; expiresAt: string };
    customerUserErrors: Array<{ message: string }>;
  };
};
const TOKEN_MUTATION = `mutation Login($input:CustomerAccessTokenCreateInput!){customerAccessTokenCreate(input:$input){customerAccessToken{accessToken expiresAt}customerUserErrors{message}}}`;
async function createSession(email: string, password: string) {
  const data = await storefrontCustomerFetch<TokenPayload>(TOKEN_MUTATION, {
    input: { email, password },
  });
  const result = data.customerAccessTokenCreate;
  if (!result.customerAccessToken)
    throw new Error(
      result.customerUserErrors[0]?.message ||
        "Email or password is incorrect.",
    );
  const accessToken = result.customerAccessToken.accessToken;
  const profile = await storefrontCustomerFetch<{
    customer?: { firstName?: string; displayName?: string };
  }>(
    `query HeaderCustomer($customerAccessToken:String!){customer(customerAccessToken:$customerAccessToken){firstName displayName}}`,
    { customerAccessToken: accessToken },
  ).catch(() => null);
  const firstName =
    profile?.customer?.firstName ||
    profile?.customer?.displayName?.split(/\s+/)[0];
  const expiresAt = new Date(result.customerAccessToken.expiresAt).getTime();
  (await cookies()).set(
    CUSTOMER_SESSION_COOKIE,
    encryptSession({ accessToken, firstName, expiresAt }),
    { ...customerCookieOptions, expires: new Date(expiresAt) },
  );
}

export async function loginAction(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(email))
    fieldErrors.email = "Please enter a valid email address.";
  if (!password) fieldErrors.password = "Please enter your password.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  try {
    await createSession(email, password);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Sign in failed.",
    };
  }
  redirect("/account");
}

export async function registerAction(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirmPassword") || "");
  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.firstName = "Please enter your first name.";
  if (!lastName) fieldErrors.lastName = "Please enter your last name.";
  if (!email) fieldErrors.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(email))
    fieldErrors.email = "Please enter a valid email address.";
  if (!password) fieldErrors.password = "Please create a password.";
  else {
    const requirements = [
      password.length >= 8,
      /[a-z]/.test(password) && /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    if (!requirements.every(Boolean))
      fieldErrors.password = "Please meet all password requirements.";
  }
  if (!confirm)
    fieldErrors.confirmPassword = "Please confirm your password.";
  else if (password !== confirm)
    fieldErrors.confirmPassword = "Passwords do not match.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  try {
    const data = await storefrontCustomerFetch<{
      customerCreate: {
        customer?: { id: string };
        customerUserErrors: Array<{ message: string }>;
      };
    }>(
      `mutation Register($input:CustomerCreateInput!){customerCreate(input:$input){customer{id}customerUserErrors{message}}}`,
      {
        input: {
          firstName,
          lastName,
          email,
          password,
          acceptsMarketing: formData.get("acceptsMarketing") === "on",
        },
      },
    );
    const result = data.customerCreate;
    if (!result.customer)
      throw new Error(
        result.customerUserErrors[0]?.message ||
          "Account could not be created.",
      );
    await createSession(email, password);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Registration failed.",
    };
  }
  redirect("/account");
}

export async function recoverAction(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email)
    return { fieldErrors: { email: "Please enter your email address." } };
  if (!EMAIL_PATTERN.test(email))
    return { fieldErrors: { email: "Please enter a valid email address." } };
  try {
    const data = await storefrontCustomerFetch<{
      customerRecover: { customerUserErrors: Array<{ message: string }> };
    }>(
      `mutation Recover($email:String!){customerRecover(email:$email){customerUserErrors{message}}}`,
      { email },
    );
    const error = data.customerRecover.customerUserErrors[0];
    if (error) return { error: error.message };
    return {
      success:
        "If an account exists for this email, Shopify has sent password reset instructions.",
    };
  } catch {
    return {
      error: "Password reset could not be requested. Please try again.",
    };
  }
}
