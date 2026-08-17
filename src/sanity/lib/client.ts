import { createClient } from "next-sanity";
import { env } from "@/lib/env";

export const sanityClient = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || "aaaaaaaa",
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: true,
  token: env.SANITY_API_READ_TOKEN,
});

export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}, tags: string[] = ["sanity"]) {
  return sanityClient.fetch<T>(query, params, { next: { revalidate: 60, tags } });
}
