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

type GuideImage = (SanityImageSource & { alt?: string }) | string;
type Fabric = { _key?: string; title?: string; tagline?: string; body?: string; character?: string; considerFor?: string };
type FinderCard = { _key?: string; title?: string; body?: string; fabrics?: string[] };
type Content = { seoTitle?: string; seoDescription?: string; hero?: { image?: GuideImage; heading?: string; tagline?: string }; introduction?: string; art?: { image?: GuideImage; eyebrow?: string; heading?: string; body?: string }; understanding?: { heading?: string; introduction?: string; image?: GuideImage; characteristics?: Characteristic[] }; fabricsHeading?: string; fabricsIntroduction?: string; fabrics?: Fabric[]; finder?: { heading?: string; introduction?: string; cards?: FinderCard[] }; guideImage?: GuideImage; guideSections?: GuideSection[]; cta?: { eyebrow?: string; heading?: string; body?: string; buttonLabel?: string; buttonHref?: string } } | null;

const characteristics: Characteristic[] = [
  { title: "Momme", body: "Momme, often abbreviated as mm, is a traditional measurement used to describe the weight of silk fabric.\n\nA lower momme generally indicates a lighter fabric, while a higher momme indicates a heavier or more substantial fabric. Always consider momme alongside drape, structure, transparency and finish." },
  { title: "Drape", body: "Drape describes the way a fabric falls and moves. A fluid fabric falls softly around the body, while a structured fabric holds its shape and creates volume or definition." },
  { title: "Lustre", body: "Lustre describes the way a fabric reflects light. Some fabrics have a luminous, glossy surface, while others have a softer or understated finish." },
  { title: "Structure", body: "Structure refers to how well a fabric holds its shape. Structured fabrics suit sculptural silhouettes, statement details and designs where volume must be maintained." },
  { title: "Transparency", body: "Silk can range from sheer and almost weightless to substantially more opaque. Transparency matters when considering layering, lining and garment construction." },
  { title: "Texture", body: "Not all silk is perfectly smooth. Textured, crisp, creped or crinkled finishes add depth and dimension to a design." },
];

const fabrics: Fabric[] = [
  ["Mulberry Silk Satin","Smooth, luminous and beautifully fluid.","An elegant sheen and graceful drape create a refined, flowing silhouette.","Smooth · Luminous · Fluid","Dresses, gowns, skirts, blouses and eveningwear."],
  ["Crepe Satin","Fluid and elegant with a refined finish.","A lustrous face and softly textured reverse offer versatility.","Fluid · Refined · Softly lustrous","Dresses, gowns, skirts, blouses and eveningwear."],
  ["Stretch Silk Satin","Satin lustre with added flexibility.","Suited to movement, comfort and a closer fit.","Smooth · Fluid · Flexible","Fitted dresses, bias silhouettes, skirts and blouses."],
  ["Duchess Satin","Substantial, smooth and structured.","Its greater body creates defined silhouettes that hold shape.","Smooth · Substantial · Structured","Structured gowns, formalwear, corsetry and statement pieces."],
  ["Dupion Silk","Distinctive, crisp and naturally textural.","Its signature surface and structured character hold shape beautifully.","Crisp · Textured · Structured","Dresses, gowns, skirts, jackets and decorative applications."],
  ["Habotai","Light, smooth and beautifully soft.","A delicate hand and lightweight drape without unnecessary weight.","Lightweight · Smooth · Soft","Linings, lightweight garments, scarves and layering."],
  ["Organza","Sheer, crisp and remarkably structured.","Creates volume without heaviness for layered and sculptural designs.","Sheer · Crisp · Structured","Overlays, sleeves, volume and structured gowns."],
  ["Georgette","Lightweight, softly textured and fluid.","Graceful movement balances softness, texture and transparency.","Lightweight · Textured · Flowing","Dresses, skirts, blouses, sleeves and overlays."],
  ["Satin Chiffon","Delicate, flowing and softly luminous.","Airy chiffon movement meets a refined surface lustre.","Lightweight · Flowing · Softly lustrous","Dresses, overlays, sleeves, scarves and layers."],
  ["Crinkle Chiffon","Airy, textured and full of movement.","A crinkled surface adds dimension while remaining light and flowing.","Lightweight · Textured · Flowing","Dresses, skirts, sleeves, overlays and layers."],
  ["Silk Mesh","Sheer and delicate with an open construction.","Introduces transparency and texture alone or when layered.","Sheer · Lightweight · Delicate","Panels, sleeves, overlays and design details."],
  ["Silk Midako","A distinctive Ivory Muse silk.","Refer to its product page for exact composition, finish and characteristics.","Product-specific","Uses depend on the individual fabric specification."],
].map(([title,tagline,body,character,considerFor]) => ({ title, tagline, body, character, considerFor }));

const guideSections: GuideSection[] = [
  { navigationLabel:"Choosing Your Silk", heading:"Choosing Your Silk", body:"Start With Your Design\n\nThink first about how you want the finished piece to behave. These questions will help narrow your selection.", bullets:["Do you want it to fall softly against the body?","Do you want the fabric to hold volume?","Should it feel light and sheer?","Do you want a luminous surface or something understated?"], notes:[{eyebrow:"Step 1",title:"Review the Product Details",body:"Consult the product page for composition, width, weight or momme, finish and care information."},{eyebrow:"Step 2",title:"Consider a Swatch",body:"Where available, order a swatch when colour, texture, weight, transparency or drape is important."}] },
  { navigationLabel:"Understanding Colour", heading:"Understanding Colour", body:"Silk interacts beautifully with light, so its appearance can change with its surroundings. Online colours may vary with photography, lighting, screen settings and devices.\n\nDifferences may also occur between dye or production lots. For consistent colour, order the full quantity at the same time." },
  { navigationLabel:"Working With Silk", heading:"Working With Silk", body:"Silk rewards considered preparation. Before cutting, inspect the fabric and confirm its type, colour and quantity. Lightweight fabrics can move during construction, so careful preparation improves precision.\n\nFor complex designs or unfamiliar fabrics, consult an experienced dressmaker, tailor or pattern maker." },
  { navigationLabel:"Caring for Silk", heading:"Caring for Silk", body:"Different fabrics require different care. Always follow the instructions for your chosen Ivory Muse fabric.", bullets:["Handle fabric with clean, dry hands.","Avoid bleach, harsh chemicals and excessive heat.","Protect fabric from prolonged direct sunlight.","Store fabric in a clean, dry environment.","Press only at a suitable low temperature.","Follow professional dry-cleaning instructions where specified.","Test unfamiliar methods on a swatch first."] },
  { navigationLabel:"Natural Characteristics", heading:"Natural Characteristics", body:"Silk is a natural fibre, and subtle variations may form part of its character. Variations in texture, lustre and appearance can occur. Always review the individual product description." },
  { navigationLabel:"Before You Order", heading:"Before You Order", body:"Before purchasing fabric for your project, we recommend:", bullets:["Review the full product description.","Check composition and width.","Review momme or weight where provided.","Consider drape and transparency.","Check care instructions.","Confirm the quantity required.","Order a swatch where appropriate."], notes:[{title:"Cut fabric returns",body:"Fabric cut to your requested length generally cannot be returned for change of mind. See our Returns & Refunds Policy."}] },
  { navigationLabel:"A Note on Our Guide", heading:"A Note on Our Silk Guide", body:"This guide provides general information. Characteristics and suitability vary with product, composition, weave, weight, finish, pattern, construction and intended use.\n\nDescriptions, suggested uses, care and sewing information are general guidance only. Review the product page and consider professional advice. Nothing in this guide modifies rights under Australian Consumer Law." },
];

const fallback: NonNullable<Content> = {
  seoTitle:"Silk Guide", seoDescription:"Discover silk characteristics, fabric types, care and guidance for choosing the right silk.",
  hero:{image:"/figma/silk-satin.jpg",heading:"Silk Guide",tagline:"Discover the character, movement and beauty of silk."},
  introduction:"Silk is a material defined by contrast. It can be fluid or structured, luminous or understated, sheer or substantial.\n\nUnderstanding these differences can help you choose a fabric that not only looks beautiful, but behaves the way your design requires. The Ivory Muse Silk Guide introduces the qualities that shape a fabric—from weave and drape to lustre and transparency—and helps you explore our collection with confidence.",
  art:{image:"/figma/silk-satin.jpg",eyebrow:"The Art of Silk",heading:"What Is Mulberry Silk?",body:"Mulberry silk is one of the most recognised forms of cultivated silk and is valued for its fine, long fibres, smooth feel and natural lustre.\n\nThe finished fabric is influenced not only by the fibre, but by the way it is woven and finished. This is why silk can take so many forms—from fluid satin to crisp organza and delicate chiffon."},
  understanding:{heading:"Understanding Silk",introduction:"Before choosing a fabric, there are a few characteristics worth understanding.",image:"/figma/silk-organza.jpg",characteristics},
  fabricsHeading:"Explore Our Silks",fabricsIntroduction:"Each fabric has its own character. Compare how it moves, reflects light and holds its shape.",fabrics,
  finder:{heading:"Find Your Silk",introduction:"Not sure where to begin? Start with the way you want your finished piece to look and move.",cards:[
    {title:"Fluidity & Movement",body:"Graceful movement and drape.",fabrics:["Mulberry Silk Satin","Crepe Satin","Stretch Silk Satin"]},{title:"Structure & Shape",body:"Definition, volume and structure.",fabrics:["Duchess Satin","Dupion Silk","Organza"]},{title:"Light & Delicate",body:"Softness and lightness.",fabrics:["Habotai","Georgette"]},{title:"Sheer & Flowing",body:"Transparency and movement.",fabrics:["Georgette","Satin Chiffon","Crinkle Chiffon"]},{title:"Sheer Structure",body:"Transparency with sculptural structure.",fabrics:["Organza"]},{title:"Texture",body:"Depth and visual interest.",fabrics:["Dupion Silk","Georgette","Crinkle Chiffon","Silk Mesh"]}
  ]},
  guideImage:"/figma/campaign.jpg",guideSections,
  cta:{eyebrow:"Begin With the Material",heading:"Exceptional creations begin with exceptional materials.",body:"Explore the Ivory Muse collection and discover the silk for your next creation.",buttonLabel:"Explore the Collection",buttonHref:"/collections/shop"},
};

function imageUrl(image?: GuideImage,width=2400){return typeof image==="string"?image:image?sanityImageUrl(image,width):undefined}
function Paragraphs({text}:{text?:string}){return text?.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{p.replace(/\s*\n\s*/g," ")}</p>)||null}
async function getContent(){const cms=isSanityConfigured?await sanityFetch<Content>(SILK_GUIDE_PAGE_QUERY,{},["silk-guide","sanity"]):null;return cms?{...fallback,...cms,hero:{...fallback.hero,...cms.hero},art:{...fallback.art,...cms.art},understanding:{...fallback.understanding,...cms.understanding},finder:{...fallback.finder,...cms.finder},cta:{...fallback.cta,...cms.cta}}:fallback}
export async function generateMetadata():Promise<Metadata>{const page=await getContent();return{title:page.seoTitle,description:page.seoDescription}}

export default async function SilkGuidePage(){const page=await getContent();const hero=imageUrl(page.hero?.image,3840),art=imageUrl(page.art?.image),understanding=imageUrl(page.understanding?.image),guide=imageUrl(page.guideImage,3000);return <main className={styles.page}>
  <section className={styles.hero}>{hero&&<Image src={hero} alt={typeof page.hero?.image==="object"?page.hero.image.alt||page.hero.heading||"":page.hero?.heading||""} fill priority quality={95} sizes="100vw"/>}<div className={styles.heroShade}/><div className={styles.heroContent}><h1>{page.hero?.heading}</h1><p>{page.hero?.tagline}</p></div></section>
  <section className={styles.intro}><Paragraphs text={page.introduction}/></section>
  <section className={styles.editorial}>{art&&<div className={styles.editorialImage}><Image src={art} alt={page.art?.heading||""} fill quality={95} sizes="(max-width:800px) 100vw,50vw"/></div>}<div className={styles.editorialCopy}><span>{page.art?.eyebrow}</span><h2>{page.art?.heading}</h2><Paragraphs text={page.art?.body}/></div></section>
  <section className={styles.understanding}><div className={styles.understandingCopy}><h2>{page.understanding?.heading}</h2><p>{page.understanding?.introduction}</p><Characteristics items={page.understanding?.characteristics||[]}/></div>{understanding&&<div className={styles.understandingImage}><Image src={understanding} alt={page.understanding?.heading||""} fill quality={95} sizes="(max-width:800px) 100vw,50vw"/></div>}</section>
  <section className={styles.fabricSection}><header><h2>{page.fabricsHeading}</h2><p>{page.fabricsIntroduction}</p></header><div className={styles.fabricGrid}>{page.fabrics?.map((f,i)=><article key={f._key||f.title||i}><span>{String(i+1).padStart(2,"0")}</span><h3>{f.title}</h3><strong>{f.tagline}</strong><p>{f.body}</p><small>{f.character}</small><p><b>Consider for:</b> {f.considerFor}</p></article>)}</div></section>
  <section className={styles.finder}><header><h2>{page.finder?.heading}</h2><p>{page.finder?.introduction}</p></header><div className={styles.finderGrid}>{page.finder?.cards?.map((c,i)=><article key={c._key||c.title||i}><h3>{c.title}</h3><p>{c.body}</p><div>{c.fabrics?.map(f=><span key={f}>{f}</span>)}</div></article>)}</div></section>
  <section className={styles.deepGuide}>{guide&&<div className={styles.guideImage}><Image src={guide} alt="Silk fabric detail" fill quality={95} sizes="100vw"/></div>}<DetailedGuide sections={page.guideSections||[]}/></section>
  <section className={styles.cta}><span>{page.cta?.eyebrow}</span><h2>{page.cta?.heading}</h2><p>{page.cta?.body}</p>{page.cta?.buttonLabel&&page.cta?.buttonHref&&<Link href={normalizeShopHref(page.cta.buttonLabel,page.cta.buttonHref)}>{page.cta.buttonLabel} <b>→</b></Link>}</section>
 </main>}
