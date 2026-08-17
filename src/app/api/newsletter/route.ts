import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const inputSchema = z.object({ email: z.string().trim().email().max(254) });

const mutation = `#graphql
  mutation NewsletterSubscribe($email: String!) {
    customerEmailMarketingSubscribe(email: $email) {
      customer { id }
      customerUserErrors { field message code }
    }
  }
`;

async function subscribeWithStorefront(email: string) {
  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) return false;
  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/api/unstable/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-storefront-access-token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query: mutation, variables: { email } }),
    cache: "no-store",
  });
  const payload = await response.json() as {
    data?: { customerEmailMarketingSubscribe?: { customer?: { id: string }; customerUserErrors?: Array<{ message: string }> } };
    errors?: Array<{ message: string }>;
  };
  const result = payload.data?.customerEmailMarketingSubscribe;
  if (result?.customer?.id) return true;
  if (result?.customerUserErrors?.length) throw new Error(result.customerUserErrors[0].message);
  return false;
}

async function subscribeWithCustomerForm(email: string) {
  if (!env.SHOPIFY_STORE_DOMAIN) return false;
  const body = new URLSearchParams({
    form_type: "customer",
    utf8: "✓",
    "contact[email]": email,
    "contact[tags]": "newsletter",
  });
  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/contact`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
    cache: "no-store",
  });
  return response.ok || response.status === 302 || response.status === 303;
}

export async function POST(request: Request) {
  try {
    const { email } = inputSchema.parse(await request.json());
    let subscribed = false;
    try {
      subscribed = await subscribeWithStorefront(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/already|taken|subscribed/i.test(message)) {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }
      throw error;
    }
    if (!subscribed) subscribed = await subscribeWithCustomerForm(email);
    if (!subscribed) throw new Error("Subscription could not be completed.");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Subscription failed. Please try again." },
      { status: 400 },
    );
  }
}
