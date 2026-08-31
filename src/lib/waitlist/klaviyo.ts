import "server-only";

import { env } from "@/lib/env";

type KlaviyoErrorResponse = {
  errors?: Array<{ detail?: string; title?: string }>;
};

type KlaviyoProfileResponse = KlaviyoErrorResponse & {
  data?: { id?: string };
};

type WaitlistConsent = {
  marketingConsent: true;
  consentText: string;
  consentedAt: string;
  consentSource: string;
};

function headers() {
  return {
    accept: "application/vnd.api+json",
    authorization: `Klaviyo-API-Key ${env.KLAVIYO_PRIVATE_API_KEY}`,
    "content-type": "application/vnd.api+json",
    revision: env.KLAVIYO_API_REVISION,
  };
}

async function errorMessage(response: Response) {
  const result = (await response.json().catch(() => null)) as KlaviyoErrorResponse | null;
  return result?.errors
    ?.map((error) => error.detail || error.title)
    .filter(Boolean)
    .join(";") || `Klaviyo request failed (${response.status}).`;
}

export async function subscribeWaitlistProfileToKlaviyo(
  email: string,
  consent: WaitlistConsent,
) {
  if (!env.KLAVIYO_PRIVATE_API_KEY || !env.KLAVIYO_WAITLIST_LIST_ID) {
    throw new Error("Klaviyo waitlist sync is not configured.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const profileResponse = await fetch("https://a.klaviyo.com/api/profile-import", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          email: normalizedEmail,
          properties: {
            signup_source: "Ivory Muse coming soon page",
            waitlist_name: "Ivory Muse Waitlist",
            marketing_consent: consent.marketingConsent,
            consent_text: consent.consentText,
            consented_at: consent.consentedAt,
            consent_source: consent.consentSource,
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (profileResponse.status !== 200 && profileResponse.status !== 201) {
    throw new Error(await errorMessage(profileResponse));
  }

  const profile = (await profileResponse.json()) as KlaviyoProfileResponse;
  const profileId = profile.data?.id;
  if (!profileId) throw new Error("Klaviyo profile ID was not returned.");

  const listResponse = await fetch(
    `https://a.klaviyo.com/api/lists/${env.KLAVIYO_WAITLIST_LIST_ID}/relationships/profiles`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ data: [{ type: "profile", id: profileId }] }),
      cache: "no-store",
    },
  );

  if (listResponse.status !== 204) {
    throw new Error(await errorMessage(listResponse));
  }

  const response = await fetch(
    "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
    {
      method: "POST",
      headers: headers(),
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
  throw new Error(await errorMessage(response));
}
