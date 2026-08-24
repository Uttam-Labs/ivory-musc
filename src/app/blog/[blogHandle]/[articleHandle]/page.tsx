import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteContainer } from "@/components/site-container";
import { CalendarIcon } from "@/components/calendar-icon";
import { isSanityConfigured } from "@/lib/env";
import { getArticle, getArticles } from "@/lib/shopify";
import type { ShopifyArticle } from "@/lib/shopify/types";
import { sanityFetch } from "@/sanity/lib/client";
import { ARTICLE_PAGE_QUERY } from "@/sanity/lib/queries";
import styles from "./article.module.css";

type ArticlePageProps = { params: Promise<{ blogHandle: string; articleHandle: string }> };
type ArticleVisibility = { showBreadcrumbs?: boolean; showBlogName?: boolean; showAuthor?: boolean; showDate?: boolean; showReadingTime?: boolean; showFeaturedImage?: boolean; showTags?: boolean; showRecent?: boolean; showBackLink?: boolean };
type ArticleLabels = { homeBreadcrumb?: string; blogBreadcrumb?: string; authorPrefix?: string; readingTimeSuffix?: string; recentHeading?: string; backLabel?: string };
type ArticleSettings = { shopifyBlogHandle?: string; recentLimit?: number; visibility?: ArticleVisibility; labels?: ArticleLabels } | null;
async function getArticleSettings() {
  if (!isSanityConfigured) return undefined;
  return sanityFetch<ArticleSettings>(ARTICLE_PAGE_QUERY, {}, ["sanity", "article-page"]);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}
function href(article: ShopifyArticle) {
  return `/blog/${encodeURIComponent(article.blog.handle)}/${encodeURIComponent(article.handle)}`;
}
function readingMinutes(article: ShopifyArticle) {
  const words = (article.content || article.contentHtml.replace(/<[^>]+>/g, " ")).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { blogHandle, articleHandle } = await params;
  const article = await getArticle(blogHandle, articleHandle);
  if (!article) return {};
  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt || article.content.slice(0, 155),
    openGraph: { title: article.seo?.title || article.title, description: article.seo?.description || article.excerpt || undefined, images: article.image ? [article.image.url] : undefined, type: "article", publishedTime: article.publishedAt },
  };
}
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { blogHandle, articleHandle } = await params;
  const [article, allArticles, settings] = await Promise.all([getArticle(blogHandle, articleHandle), getArticles(), getArticleSettings()]);
  if (!article) notFound();
  const visibility = settings?.visibility;
  const labels = settings?.labels;
  const selectedHandle = settings?.shopifyBlogHandle?.trim().toLocaleLowerCase() || "";
  const recent = allArticles
    .filter((item) => item.id !== article.id && (!selectedHandle || item.blog.handle.toLocaleLowerCase() === selectedHandle))
    .slice(0, Math.min(Math.max(settings?.recentLimit || 7, 1), 12));
  return <main className={styles.page}><SiteContainer className={styles.inner}>
    {visibility?.showBreadcrumbs !== false && <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">{labels?.homeBreadcrumb || "Home"}</Link><span>/</span><Link href="/blog">{labels?.blogBreadcrumb || "Blog"}</Link><span>/</span><span>{article.title}</span></nav>}
    <div className={styles.layout}>
      <article className={styles.article}>
        <header className={styles.header}>
          {visibility?.showBlogName !== false && <p className={styles.blogName}>{article.blog.title}</p>}
          <h1 className={styles.title}>{article.title}</h1>
          {(visibility?.showAuthor === true || visibility?.showDate !== false || visibility?.showReadingTime !== false) && <div className={styles.meta}>
            {visibility?.showAuthor === true && article.authorV2?.name && <span>{labels?.authorPrefix || "By"} {article.authorV2.name}</span>}
            {visibility?.showDate !== false && <span><CalendarIcon /><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></span>}
            {visibility?.showReadingTime !== false && <span>{readingMinutes(article)} {labels?.readingTimeSuffix || "min read"}</span>}
          </div>}
        </header>
        {visibility?.showFeaturedImage !== false && article.image && <div className={styles.hero}><Image fill priority src={article.image.url} alt={article.image.altText || article.title} className={styles.heroImage} sizes="(min-width:901px) 70vw, 100vw" /></div>}
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
        {visibility?.showTags !== false && article.tags.length > 0 && <div className={styles.tags}>{article.tags.map((tag) => <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>{tag}</Link>)}</div>}
      </article>
      {(visibility?.showRecent !== false || visibility?.showBackLink !== false) && <aside className={styles.sidebar}>
        {visibility?.showRecent !== false && <h2 className={styles.sidebarHeading}>{labels?.recentHeading || "Recent articles"}</h2>}
        {visibility?.showRecent !== false && <>
        {recent.map((item) => <article className={styles.recentItem} key={item.id}>
          {item.image && <Link className={styles.recentImage} href={href(item)}><Image fill src={item.image.url} alt={item.image.altText || item.title} sizes="100px" /></Link>}
          <div><Link className={styles.recentTitle} href={href(item)}>{item.title}</Link><div className={styles.recentDate}><CalendarIcon />{formatDate(item.publishedAt)}</div></div>
        </article>)}
        </>}
        {visibility?.showBackLink !== false && <Link className={styles.back} href="/blog">{labels?.backLabel || "Back to all articles"}</Link>}
      </aside>}
    </div>
  </SiteContainer></main>;
}
