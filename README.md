# Ivory Muse — Headless Shopify

Production-oriented storefront foundation using Next.js App Router, Shopify Storefront API, Sanity and TypeScript.

## Setup

1. Copy `.env.example` to `.env.local` and fill in all credentials.
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
