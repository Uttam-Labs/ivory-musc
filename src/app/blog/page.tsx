import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon } from "@/components/calendar-icon";
import { SiteContainer } from "@/components/site-container";
import { isSanityConfigured, isShopifyConfigured } from "@/lib/env";
import { getArticles } from "@/lib/shopify";
import type { ShopifyArticle } from "@/lib/shopify/types";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { BLOG_PAGE_QUERY } from "@/sanity/lib/queries";
import styles from "./blog.module.css";

type ImageData = SanityImageSource & { alt?: string };
type HeroSection = { _type: "blogHero"; enabled?: boolean; image?: ImageData; heading?: string; body?: string; overlayOpacity?: number };
type ListingVisibility = { showHeading?: boolean; showFilters?: boolean; showSearch?: boolean; showRecent?: boolean; showImages?: boolean; showDates?: boolean; showExcerpts?: boolean; showReadMore?: boolean; showPagination?: boolean };
type ListingSettings = { _type: "blogListingSettings"; shopifyBlogHandle?: string; heading?: string; allLabel?: string; searchPlaceholder?: string; recentHeading?: string; readMoreLabel?: string; emptyMessage?: string; articlesPerPage?: number; recentLimit?: number; listingVisibility?: ListingVisibility };
type BlogPageData = { title?: string; seoDescription?: string; sections?: Array<HeroSection | ListingSettings> } | null;
type BlogPageProps = { searchParams: Promise<{ tag?: string | string[]; q?: string | string[]; page?: string | string[] }> };

async function getBlogPage() {
  return isSanityConfigured ? sanityFetch<BlogPageData>(BLOG_PAGE_QUERY, {}, ["sanity", "blog-page"]) : null;
}
export async function generateMetadata(): Promise<Metadata> {
  const page = await getBlogPage();
  return { title: page?.title, description: page?.seoDescription };
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}
function articleHref(article: ShopifyArticle) {
  return `/blog/${encodeURIComponent(article.blog.handle)}/${encodeURIComponent(article.handle)}`;
}
function queryHref({ tag, q, page }: { tag?: string; q?: string; page?: number }) {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  if (page && page > 1) params.set("page", String(page));
  return `/blog${params.size ? `?${params}` : ""}#blog-listing`;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const [pageData, allArticles] = await Promise.all([getBlogPage(), isShopifyConfigured ? getArticles() : Promise.resolve([])]);
  const params = await searchParams;
  const activeTag = typeof params.tag === "string" ? params.tag : "";
  const searchQuery = typeof params.q === "string" ? params.q.trim() : "";
  const requestedPage = Number.parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1;
  const hero = pageData?.sections?.find((section) => section._type === "blogHero") as HeroSection | undefined;
  const settings = pageData?.sections?.find((section) => section._type === "blogListingSettings") as ListingSettings | undefined;
  const selectedBlogHandle = settings?.shopifyBlogHandle?.trim().toLocaleLowerCase() || "";
  const selectedArticles = selectedBlogHandle
    ? allArticles.filter((article) => article.blog.handle.toLocaleLowerCase() === selectedBlogHandle)
    : allArticles;
  const visibility = settings?.listingVisibility;
  const tags = Array.from(new Set(selectedArticles.flatMap((article) => article.tags)))
    .filter((tag) => tag.trim().toLocaleLowerCase() !== "all")
    .sort((a, b) => a.localeCompare(b));
  const needle = searchQuery.toLocaleLowerCase();
  const filtered = selectedArticles.filter((article) => {
    const tagMatches = !activeTag || article.tags.some((tag) => tag.toLocaleLowerCase() === activeTag.toLocaleLowerCase());
    const searchMatches = !needle || [article.title, article.excerpt || "", article.content, article.tags.join(" ")].join(" ").toLocaleLowerCase().includes(needle);
    return tagMatches && searchMatches;
  });
  const pageSize = Math.min(Math.max(settings?.articlesPerPage || 6, 2), 24);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const articles = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const recent = selectedArticles.slice(0, Math.min(Math.max(settings?.recentLimit || 7, 1), 12));
  const pageStart = Math.max(1, Math.min(currentPage - 1, totalPages - 3));
  const visiblePages = Array.from({ length: Math.min(4, totalPages) }, (_, index) => pageStart + index);

  return <main className={styles.page}>
    {hero && hero.enabled !== false && <section className={`blog--hero about-hero relative flex min-h-[600px] items-end text-white md:min-h-[450px] xl:min-h-[652px]`}>
      {hero.image && <Image fill priority src={sanityImageUrl(hero.image, 3840)} alt={hero.image.alt || hero.heading || ""} className={styles.heroImage} sizes="100vw" quality={95} />}
      <div className={styles.heroShade} style={{ backgroundColor: `rgba(0,0,0,${Math.min(Math.max(hero.overlayOpacity || 0, 0), 100) / 100})` }} />
      <SiteContainer className={`${styles.heroContent} home-hero-content about-hero-content`}><div className={`home-hero__content-wrap about-hero__content-wrap w-full md:w-4/5 xl:w-1/2`}>{hero.heading && <h1 className="hero-title max-w-[640px] font-heading text-[34px] uppercase leading-tight lg:text-[40px]">{hero.heading}</h1>}{hero.body && <p className="mt-4 w-full max-w-[700px] text-[11px] leading-5 lg:text-xs">{hero.body}</p>}</div></SiteContainer>
    </section>}
    <SiteContainer as="section" id="blog-listing" className={styles.listing}>
      {visibility?.showHeading !== false && settings?.heading && <h2 className={styles.sectionHeading}>{settings.heading}</h2>}
      {visibility?.showFilters !== false && <nav className={styles.filters} aria-label="Article tags">
        <Link className={`${styles.filter} ${!activeTag ? styles.filterActive : ""}`} href={queryHref({ q: searchQuery })}>{settings?.allLabel || "All"}</Link>
        {tags.map((tag) => <Link key={tag} className={`${styles.filter} ${activeTag.toLocaleLowerCase() === tag.toLocaleLowerCase() ? styles.filterActive : ""}`} href={queryHref({ tag, q: searchQuery })}>{tag}</Link>)}
      </nav>}
      <div className={styles.contentGrid}>
        <div className={styles.articles}>
          {articles.length ? articles.map((article) => <article className={styles.card} key={article.id}>
            {visibility?.showImages !== false && article.image && <Link className={styles.imageLink} href={articleHref(article)}><Image fill src={article.image.url} alt={article.image.altText || article.title} className={styles.cardImage} sizes="(min-width:901px) 32vw, (min-width:641px) 48vw, 100vw" quality={95} /></Link>}
            {visibility?.showDates !== false && <div className={styles.date}><CalendarIcon /><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></div>}
            <h2><Link href={articleHref(article)}>{article.title}</Link></h2>
            {visibility?.showExcerpts !== false && <p className={styles.excerpt}>{article.excerpt || article.content}</p>}
            {visibility?.showReadMore !== false && <Link className={styles.readMore} href={articleHref(article)}>{settings?.readMoreLabel || "Read more"}</Link>}
          </article>) : <p className={styles.empty}>{settings?.emptyMessage || "No articles found."}</p>}
        </div>
        {(visibility?.showSearch !== false || visibility?.showRecent !== false) && <aside className={styles.sidebar}>
          {visibility?.showSearch !== false && <form className={styles.search} action="/blog" method="get">
            {activeTag && <input type="hidden" name="tag" value={activeTag} />}
            <input type="search" name="q" defaultValue={searchQuery} placeholder={settings?.searchPlaceholder || "Search blogs..."} aria-label="Search articles" />
            <button type="submit" aria-label="Submit search"><Search size={23} strokeWidth={1.5} /></button>
          </form>}
          {visibility?.showRecent !== false && settings?.recentHeading && <h2 className={styles.recentHeading}>{settings.recentHeading}</h2>}
          {visibility?.showRecent !== false && <div className={styles.recentList}>{recent.map((article) => <article className={styles.recentItem} key={article.id}>
            {article.image && <Link className={styles.recentImageWrap} href={articleHref(article)}><Image fill src={article.image.url} alt={article.image.altText || article.title} className={styles.recentImage} sizes="120px" quality={95} /></Link>}
            <div className={styles.recentCopy}><Link className={styles.recentTitle} href={articleHref(article)}>{article.title}</Link><div className={styles.recentDate}><CalendarIcon /><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></div></div>
          </article>)}</div>}
        </aside>}
      </div>
      {visibility?.showPagination !== false && totalPages > 1 && <nav className={styles.pagination} aria-label="Blog pagination">
        {currentPage > 1 && <Link className={styles.arrow} href={queryHref({ tag: activeTag, q: searchQuery, page: currentPage - 1 })} aria-label="Previous page">‹</Link>}
        {pageStart > 1 && <><Link href={queryHref({ tag: activeTag, q: searchQuery, page: 1 })}>1</Link>{pageStart > 2 && <span>…</span>}</>}
        {visiblePages.map((item) => <Link key={item} className={item === currentPage ? styles.active : undefined} href={queryHref({ tag: activeTag, q: searchQuery, page: item })} aria-current={item === currentPage ? "page" : undefined}>{item}</Link>)}
        {visiblePages.at(-1)! < totalPages && <>{visiblePages.at(-1)! < totalPages - 1 && <span>…</span>}<Link href={queryHref({ tag: activeTag, q: searchQuery, page: totalPages })}>{totalPages}</Link></>}
        {currentPage < totalPages && <Link className={styles.arrow} href={queryHref({ tag: activeTag, q: searchQuery, page: currentPage + 1 })} aria-label="Next page">›</Link>}
      </nav>}
    </SiteContainer>
  </main>;
}
