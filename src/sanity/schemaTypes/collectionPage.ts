import { defineField, defineType } from "sanity";

export const collectionPage = defineType({
  name: "collectionPage",
  title: "Collection page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Page heading",
      type: "string",
      description: "Shown above the product grid on collection pages.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "productSort",
      title: "Product sorting",
      type: "string",
      description: "Choose the order in which products appear on collection pages.",
      initialValue: "price-ascending",
      options: {
        layout: "radio",
        list: [
          { title: "Price: Low to High", value: "price-ascending" },
          { title: "Price: High to Low", value: "price-descending" },
          { title: "Shopify collection order", value: "collection-default" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "productGridContent",
      title: "Product cards and quick view wording",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", title: "Quick-view eyebrow", type: "string", initialValue: "IVORY MUSE · SILK COLLECTION" }),
        defineField({ name: "perUnitLabel", title: "Price unit label", type: "string", initialValue: "per metre" }),
        defineField({ name: "quantityLabel", title: "Quantity label", type: "string", initialValue: "Quantity" }),
        defineField({ name: "unavailableText", title: "Unavailable combination message", type: "string", initialValue: "This option combination is unavailable." }),
        defineField({ name: "buyNowLabel", title: "Buy now button", type: "string", initialValue: "Buy now" }),
        defineField({ name: "buyLoadingLabel", title: "Buy loading text", type: "string", initialValue: "Redirecting…" }),
        defineField({ name: "addToCartLabel", title: "Add to cart button", type: "string", initialValue: "Add to cart" }),
        defineField({ name: "addingLabel", title: "Adding text", type: "string", initialValue: "Adding…" }),
        defineField({ name: "addedLabel", title: "Added text", type: "string", initialValue: "Added to cart" }),
        defineField({ name: "soldOutText", title: "Sold-out message", type: "string", initialValue: "This variant is currently sold out." }),
        defineField({ name: "specificationsHeading", title: "Specifications heading", type: "string", initialValue: "Fabric specifications" }),
        defineField({ name: "compositionLabel", title: "Composition label", type: "string", initialValue: "Composition" }),
        defineField({ name: "weightLabel", title: "Weight label", type: "string", initialValue: "Weight" }),
        defineField({ name: "widthLabel", title: "Width label", type: "string", initialValue: "Width" }),
        defineField({ name: "careLabel", title: "Care label", type: "string", initialValue: "Care" }),
        defineField({ name: "detailsLabel", title: "Full details link", type: "string", initialValue: "View full product details" }),
        defineField({ name: "loadingProductLabel", title: "Product loading message", type: "string", initialValue: "Loading product…" }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Collection page" }),
  },
});
