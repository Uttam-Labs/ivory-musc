"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { storefrontCustomerFetch } from "@/lib/customer-account/client";
import { sendAccountInviteIfInactive } from "@/lib/customer-account/admin";
import {
  CUSTOMER_SESSION_COOKIE,
  customerCookieOptions,
  encryptSession,
} from "@/lib/customer-account/session";
import {
  EMAIL_PATTERN,
  isPrivateRecoveryResult,
  validateLoginInput,
  validateRegistrationInput,
} from "@/lib/customer-account/validation";

export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
class CustomerCredentialsError extends Error {}
type TokenPayload = {
  customerAccessTokenCreate: {
    customerAccessToken?: { accessToken: string; expiresAt: string };
    customerUserErrors: Array<{ message: string }>;
  };
};
const TOKEN_MUTATION = `mutation Login($input:CustomerAccessTokenCreateInput!){customerAccessTokenCreate(input:$input){customerAccessToken{accessToken expiresAt}customerUserErrors{message}}}`;
async function createSession(
  email: string,
  password: string,
  remember: boolean,
) {
  const data = await storefrontCustomerFetch<TokenPayload>(TOKEN_MUTATION, {
    input: { email, password },
  });
  const result = data.customerAccessTokenCreate;
  if (!result.customerAccessToken)
    throw new CustomerCredentialsError(
      "The email address or password does not match our records.",
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
    encryptSession({ accessToken, firstName, remember, expiresAt }),
    remember
      ? { ...customerCookieOptions, expires: new Date(expiresAt) }
      : customerCookieOptions,
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
  const remember = formData.get("remember") === "on";
  const fieldErrors = validateLoginInput(email, password);
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  try {
    await createSession(email, password, remember);
  } catch (error) {
    if (error instanceof CustomerCredentialsError)
      return { fieldErrors: { password: error.message } };
    return {
      error:
        error instanceof Error
          ? error.message
          : "Sign in could not be completed. Please try again.",
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
  const fieldErrors = validateRegistrationInput({
    firstName,
    lastName,
    email,
    password,
    confirmPassword: confirm,
  });
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
    await createSession(email, password, true);
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
      customerRecover: {
        customerUserErrors: Array<{ code?: string | null; message: string }>;
      };
    }>(
      `mutation Recover($email:String!){customerRecover(email:$email){customerUserErrors{code message}}}`,
      { email },
    );
    const error = data.customerRecover.customerUserErrors[0];
    // Shopify deliberately treats a customer record without an active legacy
    // password account as unidentified. Keep the public recovery response
    // neutral so the form cannot be used to discover registered emails.
    if (error && !isPrivateRecoveryResult(error)) {
      return { error: error.message };
    }
    if (error) await sendAccountInviteIfInactive(email).catch(() => false);
    return {
      success:
        "If an active account exists for this email, password reset instructions will arrive shortly. Please also check your spam folder.",
    };
  } catch {
    return {
      error: "Password reset could not be requested. Please try again.",
    };
  }
}
