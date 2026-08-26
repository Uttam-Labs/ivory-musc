# Ivory Muse — Headless Shopify

Production-oriented storefront foundation using Next.js App Router, Shopify Storefront API, Sanity and TypeScript.

## Setup

1. Create `.env.local` and fill in the Shopify, Sanity and email credentials used by the project.
2. In Shopify, install/develop a Headless or custom app and grant Storefront API access for products, collections and carts.
3. In Sanity, create a project/dataset and add `http://localhost:3000` plus the deployed storefront URL to CORS origins (allow credentials).
4. Run `npm run dev`. Storefront: `http://localhost:3000`; Studio: `http://localhost:3000/studio`.

## Webhooks and cache

- Shopify webhook URL: `/api/revalidate/shopify`; use the same secret as `SHOPIFY_REVALIDATION_SECRET`.
- Sanity webhook URL: `/api/revalidate/sanity`; add `Authorization: Bearer <SANITY_REVALIDATION_SECRET>`.
- Catalog/content queries use cache tags and a five-minute fallback revalidation.

## Route map

- `/` — Sanity-led home with Shopify products
- `/collections` and `/collections/[handle]`
- `/products/[handle]`
- `/search?q=...`
- `/[slug]` — Sanity editorial pages
- `/studio` — embedded Sanity Studio
- `/api/cart` — server-side Shopify cart mutation proxy

Run `npm run check` before deployment. Deploy comfortably to Vercel or any Node.js host supported by Next.js.

## Shopify Customer Accounts

The `/account` area uses Shopify's legacy Storefront API customer flow so login and registration forms can remain inside the themed headless storefront. Enable **Legacy customer accounts** in Shopify and give the Storefront API token unauthenticated customer read/write permissions.

Alongside the existing `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, add this server-only variable locally and in Vercel:

```text
CUSTOMER_ACCOUNT_SESSION_SECRET=<at least 32 random characters>
```

Customer access tokens are encrypted in an HTTP-only, secure cookie and revoked at logout.
