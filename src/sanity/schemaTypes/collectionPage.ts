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
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Collection page" }),
  },
});
