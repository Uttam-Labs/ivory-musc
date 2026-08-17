export type Money = { amount: string; currencyCode: string };
export type ShopifyImage = { url: string; altText: string | null; width: number; height: number };
export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredDescription?: { value: string; type: string } | null;
  featuredImage: ShopifyImage | null;
  priceRange: { minVariantPrice: Money };
  variants: { nodes: Array<{ id: string; title: string; availableForSale: boolean; price: Money }> };
  images: { nodes: ShopifyImage[] };
};
export type Collection = { id: string; handle: string; title: string; description: string; image: ShopifyImage | null };
export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: { nodes: Array<{ id: string; quantity: number; merchandise: { id: string; title: string; product: Pick<Product, "handle" | "title">; image: ShopifyImage | null; price: Money } }> };
};
