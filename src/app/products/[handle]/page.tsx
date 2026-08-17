import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { formatMoney } from "@/lib/format";
import { getProduct } from "@/lib/shopify";
type ProductPageProps = { params: Promise<{ handle: string }> };
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> { const { handle } = await params; const product = await getProduct(handle); return product ? { title: product.title, description: product.description.slice(0, 160), openGraph: { images: product.featuredImage ? [product.featuredImage.url] : [] } } : {}; }
export default async function ProductPage({ params }: ProductPageProps) { const { handle } = await params; const product = await getProduct(handle); if (!product) notFound(); const variant = product.variants.nodes[0]; return <main className="mx-auto grid w-full max-w-7xl flex-1 gap-10 px-5 py-12 md:grid-cols-2"><div className="grid gap-4">{product.images.nodes.map((image, index) => <Image key={image.url} src={image.url} alt={image.altText || product.title} width={image.width} height={image.height} priority={index === 0} className="w-full rounded-2xl bg-stone-100" sizes="(min-width: 768px) 50vw, 100vw" />)}</div><div className="md:sticky md:top-10 md:self-start"><h1 className="text-4xl font-medium">{product.title}</h1><p className="mt-4 text-xl">{formatMoney(product.priceRange.minVariantPrice)}</p><p className="mt-8 whitespace-pre-line leading-7 text-stone-600">{product.description}</p>{variant && <AddToCart merchandiseId={variant.id} disabled={!variant.availableForSale} />}</div></main>; }
