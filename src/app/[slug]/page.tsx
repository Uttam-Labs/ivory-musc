import type { Metadata } from "next";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { notFound, redirect } from "next/navigation";
import { SiteContainer } from "@/components/site-container";
import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import {
  PAGE_QUERY,
  POLICY_PAGE_QUERY,
} from "@/sanity/lib/queries";
import {
  parseBody as parseDefaultPolicyBody,
  policies as defaultPolicies,
} from "../../../scripts/seed-policy-pages.mjs";
import styles from "./policy.module.css";

type PortableTextValue = Parameters<typeof PortableText>[0]["value"];
type CmsPage = {
  title: string;
  seoDescription?: string;
  body?: PortableTextValue;
} | null;
type PolicyPage = {
  _type: "policyPage";
  title: string;
  navigationLabel?: string;
  seoDescription?: string;
  body?: PortableTextValue;
} | null;
type CmsPageProps = { params: Promise<{ slug: string }> };

const legacyPolicyRoutes: Record<string, string> = {
  shipping: "/shipping-delivery",
  returns: "/returns-refunds",
  privacy: "/privacy-policy",
  terms: "/terms-conditions",
};

function loadDefaultPolicy(slug: string): PolicyPage {
  const policy = defaultPolicies.find((item) => item.slug === slug);
  return policy
    ? {
        _type: "policyPage",
        title: policy.title,
        navigationLabel: policy.navigationLabel,
        seoDescription: policy.seoDescription,
        body: parseDefaultPolicyBody(policy.content),
      }
    : null;
}

async function loadPolicyPage(slug: string) {
  return isSanityConfigured
    ? sanityFetch<PolicyPage>(POLICY_PAGE_QUERY, { slug }, [
        `policy:${slug}`,
        "policies",
        "sanity",
      ])
    : null;
}

async function loadGenericPage(slug: string) {
  return isSanityConfigured
    ? sanityFetch<CmsPage>(PAGE_QUERY, { slug }, [`page:${slug}`, "sanity"])
    : null;
}

const policyComponents: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = /^https?:\/\//i.test(href);
      const openInNewTab = Boolean(value?.openInNewTab || external);
      return (
        <a
          href={href}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noreferrer noopener" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

export async function generateMetadata({
  params,
}: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page =
    (await loadPolicyPage(slug)) ||
    loadDefaultPolicy(slug) ||
    (await loadGenericPage(slug));
  return page
    ? { title: page.title, description: page.seoDescription }
    : {};
}

export default async function CmsPageRoute({ params }: CmsPageProps) {
  const { slug } = await params;
  if (legacyPolicyRoutes[slug]) redirect(legacyPolicyRoutes[slug]);

  const policyPage = (await loadPolicyPage(slug)) || loadDefaultPolicy(slug);

  if (policyPage) {
    return (
      <main className={styles.page}>
        <SiteContainer className={styles.shell}>
          <header className={styles.header}>
            <h1>{policyPage.title}</h1>
          </header>

          <article className={styles.article}>
            {policyPage.body && (
              <PortableText
                value={policyPage.body}
                components={policyComponents}
              />
            )}
          </article>
        </SiteContainer>
      </main>
    );
  }

  const page = await loadGenericPage(slug);
  if (!page) notFound();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16">
      <h1 className="text-4xl font-medium">{page.title}</h1>
      {page.body && (
        <div className="mt-10 space-y-5 leading-7 text-stone-700">
          <PortableText value={page.body} />
        </div>
      )}
    </main>
  );
}
