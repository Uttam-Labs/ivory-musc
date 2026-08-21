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

export async function storeWaitlistSubscriber(email: string) {
  if (!env.NEXT_PUBLIC_SANITY_PROJECT_ID || !token) {
    throw new Error("Waitlist storage is not configured.");
  }

  const id = documentId(email);
  const existing = await writeClient.getDocument<{ _id: string; welcomeEmailSent?: boolean }>(id);
  if (existing) {
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
    tag: "Ivory Muse Waitlist",
    source: "Instagram waitlist landing page",
    subscribedAt: new Date().toISOString(),
    welcomeEmailSent: false,
  });
  return { id, alreadySubscribed: false, welcomeEmailSent: false };
}

export async function markWelcomeEmailSent(id: string) {
  if (!token) return;
  await writeClient.patch(id).set({ welcomeEmailSent: true }).commit();
}
