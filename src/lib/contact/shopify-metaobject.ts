import "server-only";

import { env } from "@/lib/env";
import type { ContactSubmission } from "@/lib/contact/types";

type MetaobjectCreateResponse = {
  data?: {
    metaobjectCreate?: {
      metaobject?: { id: string; handle: string } | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  };
  errors?: Array<{ message: string }>;
};

const mutation = `
  mutation CreateContactEnquiry($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;

export async function storeContactEnquiry(input: ContactSubmission) {
  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    throw new Error("Shopify Admin contact storage is not configured.");
  }

  const response = await fetch(
    `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/${env.SHOPIFY_ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          metaobject: {
            type: env.SHOPIFY_CONTACT_METAOBJECT_TYPE,
            fields: [
              { key: "first_name", value: input.firstName },
              { key: "last_name", value: input.lastName },
              { key: "email", value: input.email },
              { key: "phone", value: input.phone },
              { key: "message", value: input.message },
              { key: "submitted_at", value: input.submittedAt },
              { key: "status", value: "New" },
            ],
          },
        },
      }),
      cache: "no-store",
    },
  );

  const result = (await response.json()) as MetaobjectCreateResponse;
  const payload = result.data?.metaobjectCreate;
  const errors = [
    ...(result.errors?.map(({ message }) => message) || []),
    ...(payload?.userErrors.map(({ message }) => message) || []),
  ];

  if (!response.ok || errors.length || !payload?.metaobject) {
    throw new Error(errors.join("; ") || `Shopify Admin API failed (${response.status}).`);
  }

  return payload.metaobject;
}
