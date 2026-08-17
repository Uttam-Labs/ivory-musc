import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  SHOPIFY_STORE_DOMAIN: z.string().optional(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_STOREFRONT_API_VERSION: z.string().default("2026-07"),
  SHOPIFY_REVALIDATION_SECRET: z.string().optional(),
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
