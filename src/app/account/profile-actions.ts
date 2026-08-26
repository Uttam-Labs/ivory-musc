"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { customerAccountFetch } from "@/lib/customer-account/client";
import {
  CUSTOMER_SESSION_COOKIE,
  customerCookieOptions,
  encryptSession,
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

async function updateCustomer(input: Record<string, unknown>) {
  const result = (
    await customerAccountFetch<UpdateResult>(mutation, { customer: input })
  ).customerUpdate;
  const error = result.customerUserErrors[0];
  if (error) throw new Error(error.message);
  if (result.customerAccessToken) {
    const expiresAt = new Date(result.customerAccessToken.expiresAt).getTime();
    (await cookies()).set(
      CUSTOMER_SESSION_COOKIE,
      encryptSession({
        accessToken: result.customerAccessToken.accessToken,
        expiresAt,
      }),
      { ...customerCookieOptions, expires: new Date(expiresAt) },
    );
  }
}

export async function updateProfile(formData: FormData) {
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
      phone: formData.get("phone"),
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
  const parsed = z.string().min(8).safeParse(formData.get("password"));
  let next: string;
  if (!parsed.success)
    next = destination("error", "Password must contain at least 8 characters.");
  else
    try {
      await updateCustomer({ password: parsed.data });
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
