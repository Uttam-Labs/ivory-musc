import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  SHOPIFY_STORE_DOMAIN: z.string().optional(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_STOREFRONT_API_VERSION: z.string().default("2026-07"),
  SHOPIFY_REVALIDATION_SECRET: z.string().optional(),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_ADMIN_API_VERSION: z.string().default("2026-07"),
  SHOPIFY_CONTACT_METAOBJECT_TYPE: z.string().default("contact_enquiry"),
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: z.string().optional(),
  CUSTOMER_ACCOUNT_SESSION_SECRET: z.string().min(32).optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  NODEMAILER_EMAIL: z.string().optional(),
  NODEMAILER_APP_PASSWORD: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_CREDENTIAL_ENCRYPTION_KEY: z.string().optional(),
  WAITLIST_EMAIL_FROM: z.string().optional(),
  WAITLIST_NOTIFICATION_TO: z.string().optional(),
  WAITLIST_WELCOME_SUBJECT: z.string().default("Welcome to the Ivory Muse waitlist"),
  SANITY_API_WRITE_TOKEN: z.string().optional(),
  PREVIEW_PASSWORD_PROTECTED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  PREVIEW_USERNAME: z.string().optional(),
  PREVIEW_PASSWORD: z.string().optional(),
  PREVIEW_AUTH_SECRET: z.string().optional(),
  CONTACT_EMAIL_FROM: z.string().optional(),
  CONTACT_EMAIL_TO: z.string().optional(),
  CONTACT_EMAIL_SUBJECT_PREFIX: z.string().default("Ivory Muse website enquiry"),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().default("production"),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().default("2026-08-01"),
  SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_REVALIDATION_SECRET: z.string().optional(),
  FIGMA_FILE_URL: optionalUrl,
  FIGMA_ACCESS_TOKEN: z.string().optional(),
});

export const env = schema.parse(process.env);
export const isShopifyConfigured = Boolean(
  env.SHOPIFY_STORE_DOMAIN && env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
);
export const isSanityConfigured = Boolean(env.NEXT_PUBLIC_SANITY_PROJECT_ID);
