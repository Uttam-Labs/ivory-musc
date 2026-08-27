"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import { customerAccountFetch } from "@/lib/customer-account/client";
import {
  CUSTOMER_SESSION_COOKIE,
  customerCookieOptions,
  encryptSession,
  getCustomerSession,
} from "@/lib/customer-account/session";

type UpdateResult = {
  customerUpdate: {
    customer?: { id: string };
    customerAccessToken?: { accessToken: string; expiresAt: string };
    customerUserErrors: Array<{ message: string }>;
  };
};
const mutation = `mutation UpdateCustomer($customerAccessToken:String!,$customer:CustomerUpdateInput!){customerUpdate(customerAccessToken:$customerAccessToken,customer:$customer){customer{id}customerAccessToken{accessToken expiresAt}customerUserErrors{message}}}`;
const destination = (type: "success" | "error", message: string) =>
  `/account/profile?${type}=${encodeURIComponent(message)}`;
const supportedPhoneCountries = new Set<string>(getCountries());
const normalizePhone = (phone: string, countryIso: string) => {
  const value = phone.trim();
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (value.startsWith("+")) return `+${digits}`;
  const country = supportedPhoneCountries.has(countryIso)
    ? (countryIso as CountryCode)
    : "AU";
  const code = `+${getCountryCallingCode(country)}`;
  return `${code}${digits.replace(/^0+/, "")}`;
};

async function updateCustomer(input: Record<string, unknown>) {
  const session = await getCustomerSession();
  if (!session)
    throw new Error("Your session has expired. Please sign in again.");
  const result = (
    await customerAccountFetch<UpdateResult>(mutation, { customer: input })
  ).customerUpdate;
  const error = result.customerUserErrors[0];
  if (error) throw new Error(error.message);
  const accessToken =
    result.customerAccessToken?.accessToken || session.accessToken;
  const expiresAt = result.customerAccessToken
    ? new Date(result.customerAccessToken.expiresAt).getTime()
    : session.expiresAt;
  const firstName =
    typeof input.firstName === "string" ? input.firstName : session.firstName;
  const remember = session.remember !== false;
  (await cookies()).set(
    CUSTOMER_SESSION_COOKIE,
    encryptSession({ accessToken, firstName, remember, expiresAt }),
    remember
      ? { ...customerCookieOptions, expires: new Date(expiresAt) }
      : customerCookieOptions,
  );
}

export async function updateProfile(formData: FormData) {
  const phoneCountry = String(formData.get("phoneCountry") || "AU");
  const parsed = z
    .object({
      firstName: z.string().trim().min(1),
      lastName: z.string().trim().min(1),
      email: z.string().trim().email(),
      phone: z.string().trim().max(30),
    })
    .safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: normalizePhone(String(formData.get("phone") || ""), phoneCountry),
    });
  let next: string;
  if (!parsed.success)
    next = destination("error", "Enter valid contact details.");
  else
    try {
      await updateCustomer({
        ...parsed.data,
        acceptsMarketing: formData.get("acceptsMarketing") === "on",
      });
      revalidatePath("/account");
      revalidatePath("/account/profile");
      next = destination("success", "Your details have been updated.");
    } catch (error) {
      next = destination(
        "error",
        error instanceof Error
          ? error.message
          : "Profile could not be updated.",
      );
    }
  redirect(next);
}

export async function updatePassword(formData: FormData) {
  const parsed = z
    .object({ password: z.string().min(8), confirmPassword: z.string().min(8) })
    .refine((data) => data.password === data.confirmPassword)
    .safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
  let next: string;
  if (!parsed.success)
    next = destination(
      "error",
      "Passwords must match and contain at least 8 characters.",
    );
  else
    try {
      await updateCustomer({ password: parsed.data.password });
      next = destination("success", "Your password has been updated.");
    } catch (error) {
      next = destination(
        "error",
        error instanceof Error
          ? error.message
          : "Password could not be updated.",
      );
    }
  redirect(next);
}
