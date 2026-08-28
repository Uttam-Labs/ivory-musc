import "server-only";

import { env } from "@/lib/env";

const WAITLIST_TAG = "Ivory Muse Waitlist";

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type UserError = { field?: string[] | null; message: string };

async function shopifyAdminRequest<T>(query: string, variables: Record<string, unknown>) {
  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    throw new Error("Shopify Admin customer sync is not configured.");
  }

  const response = await fetch(
    `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/${env.SHOPIFY_ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    },
  );
  const result = (await response.json()) as GraphqlResponse<T>;
  if (!response.ok || result.errors?.length) {
    throw new Error(
      result.errors?.map(({ message }) => message).join("; ") ||
        `Shopify Admin API failed (${response.status}).`,
    );
  }
  if (!result.data) throw new Error("Shopify Admin API returned no data.");
  return result.data;
}

async function findCustomerId(email: string) {
  const data = await shopifyAdminRequest<{
    customers: { nodes: Array<{ id: string }> };
  }>(
    `query FindWaitlistCustomer($query: String!) {
      customers(first: 1, query: $query) { nodes { id } }
    }`,
    { query: `email:${JSON.stringify(email.toLowerCase())}` },
  );
  return data.customers.nodes[0]?.id;
}

async function updateExistingCustomer(customerId: string, consentUpdatedAt: string) {
  const tagData = await shopifyAdminRequest<{
    tagsAdd: { userErrors: UserError[] };
  }>(
    `mutation AddWaitlistTag($id: ID!, $tags: [String!]!) {
      tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
    }`,
    { id: customerId, tags: [WAITLIST_TAG] },
  );
  if (tagData.tagsAdd.userErrors.length) {
    throw new Error(tagData.tagsAdd.userErrors.map(({ message }) => message).join("; "));
  }

  const consentData = await shopifyAdminRequest<{
    customerEmailMarketingConsentUpdate: { userErrors: UserError[] };
  }>(
    `mutation SubscribeWaitlistCustomer($input: CustomerEmailMarketingConsentUpdateInput!) {
      customerEmailMarketingConsentUpdate(input: $input) {
        userErrors { field message }
      }
    }`,
    {
      input: {
        customerId,
        emailMarketingConsent: {
          marketingState: "SUBSCRIBED",
          marketingOptInLevel: "SINGLE_OPT_IN",
          consentUpdatedAt,
        },
      },
    },
  );
  if (consentData.customerEmailMarketingConsentUpdate.userErrors.length) {
    console.error(
      "Waitlist Shopify consent update failed:",
      consentData.customerEmailMarketingConsentUpdate.userErrors
        .map(({ message }) => message)
        .join("; "),
    );
  }
  return customerId;
}

export async function syncWaitlistCustomerToShopify(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const consentUpdatedAt = new Date().toISOString();
  const existingCustomerId = await findCustomerId(normalizedEmail);
  if (existingCustomerId) {
    return updateExistingCustomer(existingCustomerId, consentUpdatedAt);
  }

  const data = await shopifyAdminRequest<{
    customerCreate: {
      customer: { id: string } | null;
      userErrors: UserError[];
    };
  }>(
    `mutation CreateWaitlistCustomer($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer { id }
        userErrors { field message }
      }
    }`,
    {
      input: {
        email: normalizedEmail,
        tags: [WAITLIST_TAG],
      },
    },
  );

  if (data.customerCreate.customer) {
    return updateExistingCustomer(data.customerCreate.customer.id, consentUpdatedAt);
  }

  // A simultaneous submission can create the customer after our initial lookup.
  const customerId = await findCustomerId(normalizedEmail);
  if (customerId) return updateExistingCustomer(customerId, consentUpdatedAt);
  throw new Error(
    data.customerCreate.userErrors.map(({ message }) => message).join("; ") ||
      "Shopify customer could not be created.",
  );
}
