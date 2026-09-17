import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));
const emptyStringAsUndefined = (value: unknown) => value === "" ? undefined : value;
const stringWithDefault = (fallback: string) => z.preprocess(emptyStringAsUndefined, z.string().default(fallback));

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  SHOPIFY_STORE_DOMAIN: z.string().optional(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_STOREFRONT_API_VERSION: stringWithDefault("2026-07"),
  SHOPIFY_REVALIDATION_SECRET: z.string().optional(),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_ADMIN_API_VERSION: stringWithDefault("2026-07"),
  SHOPIFY_CONTACT_METAOBJECT_TYPE: stringWithDefault("contact_enquiry"),
  CUSTOMER_ACCOUNT_SESSION_SECRET: z.string().min(32).optional(),
  KLAVIYO_PRIVATE_API_KEY: z.string().optional(),
  KLAVIYO_WAITLIST_LIST_ID: z.string().optional(),
  KLAVIYO_API_REVISION: stringWithDefault("2026-07-15"),
  SANITY_API_WRITE_TOKEN: z.string().optional(),
  PREVIEW_PASSWORD_PROTECTED: z.preprocess(emptyStringAsUndefined, z.enum(["true", "false"]).default("false")).transform((value) => value === "true"),
  PREVIEW_USERNAME: z.string().optional(),
  PREVIEW_PASSWORD: z.string().optional(),
  PREVIEW_AUTH_SECRET: z.string().optional(),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_SANITY_DATASET: stringWithDefault("production"),
  NEXT_PUBLIC_SANITY_API_VERSION: stringWithDefault("2026-08-01"),
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
