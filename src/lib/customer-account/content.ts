import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { ACCOUNT_CONTENT_QUERY } from "@/sanity/lib/queries";

export async function getAccountContent<T>(id: string): Promise<Partial<T>> {
  if (!isSanityConfigured) return {};
  return (await sanityFetch<Partial<T> | null>(ACCOUNT_CONTENT_QUERY, { id }, ["sanity", "account-content", id]).catch(() => null)) || {};
}

export type LoginContent = { seoTitle: string; eyebrow: string; heading: string; description: string; emailLabel: string; passwordLabel: string; rememberLabel: string; forgotPasswordLabel: string; submitLabel: string; submittingLabel: string; newCustomerText: string; registerLinkLabel: string };
export type RegisterContent = { seoTitle: string; eyebrow: string; heading: string; description: string; firstNameLabel: string; lastNameLabel: string; emailLabel: string; passwordLabel: string; passwordHint: string; confirmPasswordLabel: string; marketingLabel: string; submitLabel: string; submittingLabel: string; existingCustomerText: string; loginLinkLabel: string };
export type RecoveryContent = { seoTitle: string; eyebrow: string; heading: string; description: string; emailLabel: string; submitLabel: string; submittingLabel: string; backLabel: string };
