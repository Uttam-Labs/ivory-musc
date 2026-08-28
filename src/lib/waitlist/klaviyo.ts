import "server-only";

import { env } from "@/lib/env";

type KlaviyoErrorResponse = {
  errors?: Array<{ detail?: string; title?: string }>;
};

export async function subscribeWaitlistProfileToKlaviyo(email: string) {
  if (!env.KLAVIYO_PRIVATE_API_KEY || !env.KLAVIYO_WAITLIST_LIST_ID) {
    throw new Error("Klaviyo waitlist sync is not configured.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const response = await fetch(
    "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
    {
      method: "POST",
      headers: {
        accept: "application/vnd.api+json",
        authorization: `Klaviyo-API-Key ${env.KLAVIYO_PRIVATE_API_KEY}`,
        "content-type": "application/vnd.api+json",
        revision: env.KLAVIYO_API_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email: normalizedEmail,
                    subscriptions: {
                      email: { marketing: { consent: "SUBSCRIBED" } },
                    },
                  },
                },
              ],
            },
            historical_import: false,
          },
          relationships: {
            list: {
              data: { type: "list", id: env.KLAVIYO_WAITLIST_LIST_ID },
            },
          },
        },
      }),
      cache: "no-store",
    },
  );

  if (response.status === 202) return;

  const result = (await response.json().catch(() => null)) as KlaviyoErrorResponse | null;
  const details = result?.errors
    ?.map((error) => error.detail || error.title)
    .filter(Boolean)
    .join("; ");
  throw new Error(details || `Klaviyo subscription failed (${response.status}).`);
}
