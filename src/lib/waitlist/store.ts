import "server-only";

import { createHash } from "node:crypto";
import { createClient } from "next-sanity";
import { env } from "@/lib/env";

const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN;
const writeClient = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || "aaaaaaaa",
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token,
});

function documentId(email: string) {
  return `waitlistSubscriber.${createHash("sha256").update(email.toLowerCase()).digest("hex")}`;
}

export async function storeWaitlistSubscriber(
  email: string,
  consentText?: string,
  consentedAt = new Date().toISOString(),
  source = "Ivory Muse waitlist page",
) {
  if (!env.NEXT_PUBLIC_SANITY_PROJECT_ID || !token) {
    throw new Error("Waitlist storage is not configured.");
  }

  const id = documentId(email);
  const existing = await writeClient.getDocument<{ _id: string; welcomeEmailSent?: boolean }>(id);
  if (existing) {
    await writeClient
      .patch(id)
      .set({
        marketingConsent: true,
        consentText,
        consentedAt,
        source,
      })
      .commit();
    return {
      id,
      alreadySubscribed: true,
      welcomeEmailSent: existing.welcomeEmailSent === true,
    };
  }

  await writeClient.createIfNotExists({
    _id: id,
    _type: "waitlistSubscriber",
    email: email.toLowerCase(),
    marketingConsent: true,
    consentText,
    consentedAt,
    tag: "Ivory Muse Waitlist",
    source,
    subscribedAt: consentedAt,
    welcomeEmailSent: false,
  });
  return { id, alreadySubscribed: false, welcomeEmailSent: false };
}

export async function markWelcomeEmailSent(id: string) {
  if (!token) return;
  await writeClient.patch(id).set({ welcomeEmailSent: true }).commit();
}
