import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { PAGE_QUERY } from "@/sanity/lib/queries";
type CmsPage = { title: string; seoDescription?: string; body?: Parameters<typeof PortableText>[0]["value"] } | null;
async function loadPage(slug: string) { return isSanityConfigured ? sanityFetch<CmsPage>(PAGE_QUERY, { slug }, [`page:${slug}`, "sanity"]) : null; }
type CmsPageProps = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> { const { slug } = await params; const page = await loadPage(slug); return page ? { title: page.title, description: page.seoDescription } : {}; }
export default async function CmsPageRoute({ params }: CmsPageProps) { const { slug } = await params; const page = await loadPage(slug); if (!page) notFound(); return <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16"><h1 className="text-4xl font-medium">{page.title}</h1>{page.body && <div className="mt-10 space-y-5 leading-7 text-stone-700"><PortableText value={page.body} /></div>}</main>; }
