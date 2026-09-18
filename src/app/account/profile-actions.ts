"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { customerAccountFetch } from "@/lib/customer-account/client";

type Result = { userErrors: Array<{ message: string }> };
const destination = (type: "success" | "error", message: string) => `/account/profile?${type}=${encodeURIComponent(message)}`;

export async function updateProfile(formData: FormData) {
  const parsed = z.object({ firstName: z.string().trim().min(1), lastName: z.string().trim().min(1), acceptsMarketing: z.boolean() }).safeParse({ firstName: formData.get("firstName"), lastName: formData.get("lastName"), acceptsMarketing: formData.get("acceptsMarketing") === "on" });
  let next: string;
  if (!parsed.success) next = destination("error", "Enter valid contact details.");
  else try {
    const updated = await customerAccountFetch<{ customerUpdate: Result }>(`mutation UpdateCustomer($input: CustomerUpdateInput!) { customerUpdate(input: $input) { userErrors { message } } }`, { input: { firstName: parsed.data.firstName, lastName: parsed.data.lastName } });
    const updateError = updated.customerUpdate.userErrors[0]; if (updateError) throw new Error(updateError.message);
    const mutation = parsed.data.acceptsMarketing ? `mutation Subscribe { customerEmailMarketingSubscribe { userErrors { message } } }` : `mutation Unsubscribe { customerEmailMarketingUnsubscribe { userErrors { message } } }`;
    const marketing = await customerAccountFetch<Record<string, Result>>(mutation);
    const marketingError = Object.values(marketing)[0]?.userErrors?.[0]; if (marketingError) throw new Error(marketingError.message);
    revalidatePath("/account"); revalidatePath("/account/profile"); next = destination("success", "Your details have been updated.");
  } catch (error) { next = destination("error", error instanceof Error ? error.message : "Profile could not be updated."); }
  redirect(next);
}
