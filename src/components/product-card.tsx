import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/shopify/types";

export function ProductCard({ product }: { product: Product }) {
  return <article className="group">
    <Link href={`/products/${product.handle}`} className="block overflow-hidden rounded-2xl bg-stone-100">
      {product.featuredImage ? <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} width={product.featuredImage.width} height={product.featuredImage.height} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" /> : <div className="aspect-[4/5]" />}
    </Link>
    <div className="mt-3 flex items-start justify-between gap-4"><h3><Link href={`/products/${product.handle}`}>{product.title}</Link></h3><p className="whitespace-nowrap text-stone-600">{formatMoney(product.priceRange.minVariantPrice)}</p></div>
  </article>;
}
