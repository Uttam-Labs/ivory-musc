import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";
import { isSanityConfigured } from "@/lib/env";
import { normalizeShopHref } from "@/lib/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { SILK_GUIDE_PAGE_QUERY } from "@/sanity/lib/queries";
import { Characteristics, DetailedGuide, type Characteristic, type GuideSection } from "./silk-guide-interactive";
import styles from "./silk-guide.module.css";

type GuideImage = SanityImageSource & { alt?: string };
type Fabric = { _key?: string; title?: string; tagline?: string; body?: string; character?: string; considerFor?: string };
type FinderCard = { _key?: string; title?: string; body?: string; fabrics?: string[] };
type SectionVisibility = { hero?: boolean; introduction?: boolean; art?: boolean; understanding?: boolean; fabrics?: boolean; finder?: boolean; detailedGuide?: boolean; cta?: boolean };
type Content = { seoTitle?: string; seoDescription?: string; sectionVisibility?: SectionVisibility; hero?: { image?: GuideImage; heading?: string; tagline?: string }; introduction?: string; art?: { image?: GuideImage; eyebrow?: string; heading?: string; body?: string }; understanding?: { heading?: string; introduction?: string; image?: GuideImage; characteristics?: Characteristic[] }; fabricsHeading?: string; fabricsIntroduction?: string; considerForLabel?: string; fabrics?: Fabric[]; finder?: { heading?: string; introduction?: string; cards?: FinderCard[] }; guideImage?: GuideImage; guideSections?: GuideSection[]; cta?: { eyebrow?: string; heading?: string; body?: string; buttonLabel?: string; buttonHref?: string } } | null;

function imageUrl(image?: GuideImage,width=2400){return image?sanityImageUrl(image,width):undefined}
function imageAlt(image?:GuideImage,fallback=""){return image?.alt||fallback}
function Paragraphs({text}:{text?:string}){return text?.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{p.replace(/\s*\n\s*/g," ")}</p>)||null}
async function getContent(){return isSanityConfigured?sanityFetch<Content>(SILK_GUIDE_PAGE_QUERY,{},["silk-guide","sanity"]):null}

export async function generateMetadata():Promise<Metadata>{const page=await getContent();return{title:page?.seoTitle||undefined,description:page?.seoDescription||undefined}}

export default async function SilkGuidePage(){
  const page=await getContent();
  if(!page)return <main className={styles.page}/>;
  const visible=page.sectionVisibility||{};
  const hero=imageUrl(page.hero?.image,3840),art=imageUrl(page.art?.image),understanding=imageUrl(page.understanding?.image),guide=imageUrl(page.guideImage,3000);
  const hasHero=Boolean(hero||page.hero?.heading||page.hero?.tagline);
  const hasArt=Boolean(art||page.art?.eyebrow||page.art?.heading||page.art?.body);
  const hasUnderstanding=Boolean(understanding||page.understanding?.heading||page.understanding?.introduction||page.understanding?.characteristics?.length);
  const hasFabrics=Boolean(page.fabricsHeading||page.fabricsIntroduction||page.fabrics?.length);
  const hasFinder=Boolean(page.finder?.heading||page.finder?.introduction||page.finder?.cards?.length);
  const hasGuide=Boolean(guide||page.guideSections?.length);
  const hasCta=Boolean(page.cta?.eyebrow||page.cta?.heading||page.cta?.body||page.cta?.buttonLabel);
  return <main className={styles.page}>
    {visible.hero!==false&&hasHero&&<section className={styles.hero}>{hero&&<Image src={hero} alt={imageAlt(page.hero?.image,page.hero?.heading)} fill priority quality={95} sizes="100vw"/>}<div className={styles.heroShade}/><div className={styles.heroContent}><h1>{page.hero?.heading}</h1><p>{page.hero?.tagline}</p></div></section>}
    {visible.introduction!==false&&Boolean(page.introduction?.trim())&&<section className={styles.intro}><Paragraphs text={page.introduction}/></section>}
    {visible.art!==false&&hasArt&&<section className={styles.editorial}>{art&&<div className={styles.editorialImage}><Image src={art} alt={imageAlt(page.art?.image,page.art?.heading)} fill quality={95} sizes="(max-width:800px) 100vw,50vw"/></div>}<div className={styles.editorialCopy}><span>{page.art?.eyebrow}</span><h2>{page.art?.heading}</h2><Paragraphs text={page.art?.body}/></div></section>}
    {visible.understanding!==false&&hasUnderstanding&&<section className={styles.understanding}><div className={styles.understandingCopy}><h2>{page.understanding?.heading}</h2><p>{page.understanding?.introduction}</p><Characteristics items={page.understanding?.characteristics||[]}/></div>{understanding&&<div className={styles.understandingImage}><Image src={understanding} alt={imageAlt(page.understanding?.image,page.understanding?.heading)} fill quality={95} sizes="(max-width:800px) 100vw,50vw"/></div>}</section>}
    {visible.fabrics!==false&&hasFabrics&&<section className={styles.fabricSection}><header><h2>{page.fabricsHeading}</h2><p>{page.fabricsIntroduction}</p></header><div className={styles.fabricGrid}>{page.fabrics?.map((f,i)=><article key={f._key||f.title||i}><span>{String(i+1).padStart(2,"0")}</span><h3>{f.title}</h3><strong>{f.tagline}</strong><p>{f.body}</p><small>{f.character}</small>{f.considerFor&&<p>{page.considerForLabel&&<b>{page.considerForLabel}</b>} {f.considerFor}</p>}</article>)}</div></section>}
    {visible.finder!==false&&hasFinder&&<section className={styles.finder}><header><h2>{page.finder?.heading}</h2><p>{page.finder?.introduction}</p></header><div className={styles.finderGrid}>{page.finder?.cards?.map((c,i)=><article key={c._key||c.title||i}><h3>{c.title}</h3><p>{c.body}</p><div>{c.fabrics?.map(f=><span key={f}>{f}</span>)}</div></article>)}</div></section>}
    {visible.detailedGuide!==false&&hasGuide&&<section className={styles.deepGuide}>{guide&&<div className={styles.guideImage}><Image src={guide} alt={imageAlt(page.guideImage)} fill quality={95} sizes="100vw"/></div>}<DetailedGuide sections={page.guideSections||[]}/></section>}
    {visible.cta!==false&&hasCta&&<section className={styles.cta}><span>{page.cta?.eyebrow}</span><h2>{page.cta?.heading}</h2><p>{page.cta?.body}</p>{page.cta?.buttonLabel&&page.cta?.buttonHref&&<Link href={normalizeShopHref(page.cta.buttonLabel,page.cta.buttonHref)}>{page.cta.buttonLabel} <b>→</b></Link>}</section>}
  </main>
}
