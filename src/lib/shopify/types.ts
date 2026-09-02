export type Money = { amount: string; currencyCode: string };
export type ShopifyImage = { url: string; altText: string | null; width: number; height: number };
export type SelectedOption = { name: string; value: string };
export type ProductOptionValue = {
  id: string;
  name: string;
  swatch: {
    color: string | null;
    image: { previewImage: { url: string } | null } | null;
  } | null;
};
export type ProductOption = {
  id: string;
  name: string;
  optionValues: ProductOptionValue[];
};
export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  image: ShopifyImage | null;
  selectedOptions: SelectedOption[];
};
export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredTitle?: { value: string } | null;
  featuredDescription?: { value: string; type: string } | null;
  composition?: { value: string } | null;
  fabricWeight?: { value: string } | null;
  fabricWidth?: { value: string } | null;
  care?: { value: string } | null;
  sampleProduct?: { reference: Product | null } | null;
  featuredImage: ShopifyImage | null;
  priceRange: { minVariantPrice: Money };
  options?: ProductOption[];
  variants: { nodes: ProductVariant[] };
  images: { nodes: ShopifyImage[] };
};
export type Collection = { id: string; handle: string; title: string; description: string; image: ShopifyImage | null };
export type ShopifyArticle = {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  excerptHtml: string | null;
  content: string;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  image: ShopifyImage | null;
  authorV2: { name: string } | null;
  blog: { handle: string; title: string };
  seo: { title: string | null; description: string | null } | null;
};
export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: { nodes: Array<{ id: string; quantity: number; cost: { amountPerQuantity: Money; totalAmount: Money }; merchandise: { id: string; title: string; product: Pick<Product, "handle" | "title">; image: ShopifyImage | null; price: Money; compareAtPrice: Money | null } }> };
};
