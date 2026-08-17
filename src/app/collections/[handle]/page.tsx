import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getCollection } from "@/lib/shopify";
export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params; const collection = await getCollection(handle); if (!collection) notFound();
  return <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-16"><h1 className="text-4xl font-medium">{collection.title}</h1>{collection.description && <p className="mt-4 max-w-2xl text-stone-600">{collection.description}</p>}<div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{collection.products.nodes.map((product) => <ProductCard key={product.id} product={product} />)}</div></main>;
}
