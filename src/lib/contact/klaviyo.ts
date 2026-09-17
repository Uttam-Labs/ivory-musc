import "server-only";

import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import type { ContactSubmission } from "@/lib/contact/types";

type KlaviyoErrorResponse = {
  errors?: Array<{ detail?: string; title?: string }>;
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

export async function trackContactEnquiryInKlaviyo(input: ContactSubmission) {
  if (!env.KLAVIYO_PRIVATE_API_KEY) {
    throw new Error("Klaviyo contact event tracking is not configured.");
  }

  const response = await fetch("https://a.klaviyo.com/api/events", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        type: "event",
        attributes: {
          unique_id: randomUUID(),
          time: input.submittedAt,
          metric: {
            data: {
              type: "metric",
              attributes: { name: "Contact Form Submitted" },
            },
          },
          profile: {
            data: {
              type: "profile",
              attributes: {
                email: input.email.trim().toLowerCase(),
                first_name: input.name,
                properties: {
                  contact_source: "Ivory Muse website contact form",
                  contact_phone: input.phone,
                },
              },
            },
          },
          properties: {
            name: input.name,
            email: input.email.trim().toLowerCase(),
            phone: input.phone,
            message: input.message,
            attachment_id: input.attachmentId || "",
            attachment_name: input.attachmentName || "",
            submitted_at: input.submittedAt,
            source: "Ivory Muse website contact form",
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (response.status !== 202) {
    throw new Error(await errorMessage(response));
  }
}
