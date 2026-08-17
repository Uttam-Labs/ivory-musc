import Link from "next/link";
import Image from "next/image";
import { SetupNotice } from "@/components/setup-notice";
import { isShopifyConfigured } from "@/lib/env";
import { getCollections } from "@/lib/shopify";
export const metadata = { title: "Collections" };
export default async function CollectionsPage() {
  if (!isShopifyConfigured) return <main className="flex-1 px-5 py-20"><SetupNotice /></main>;
  const collections = await getCollections();
  return <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-16"><h1 className="text-4xl font-medium">Collections</h1><div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{collections.map((collection) => <Link key={collection.id} href={`/collections/${collection.handle}`} className="group"><div className="overflow-hidden rounded-2xl bg-stone-100">{collection.image ? <Image src={collection.image.url} alt={collection.image.altText || collection.title} width={collection.image.width} height={collection.image.height} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="aspect-[4/3]" />}</div><h2 className="mt-3 text-xl">{collection.title}</h2></Link>)}</div></main>;
}
