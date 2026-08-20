import { defineArrayMember, defineField, defineType } from "sanity";

export const productPage = defineType({
  name: "productPage",
  title: "Product page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", initialValue: "Product page" }),
    defineField({
      name: "sections",
      title: "Page sections",
      type: "array",
      validation: (rule) => rule.max(2),
      of: [
        defineArrayMember({
          name: "productDetailsSettings",
          title: "Product details settings",
          type: "object",
          fields: [
            defineField({ name: "homeLabel", title: "Breadcrumb home label", type: "string" }),
            defineField({ name: "homeHref", title: "Breadcrumb home link", type: "string" }),
            defineField({ name: "collectionLabel", title: "Breadcrumb collection label", type: "string" }),
            defineField({ name: "collectionHref", title: "Breadcrumb collection link", type: "string" }),
            defineField({ name: "perUnitLabel", title: "Price unit label", type: "string" }),
            defineField({ name: "quantityLabel", title: "Quantity label", type: "string" }),
            defineField({ name: "totalLabel", title: "Total label", type: "string" }),
            defineField({ name: "minimumPurchaseText", title: "Minimum purchase note", type: "string" }),
            defineField({ name: "buyNowLabel", title: "Buy now button", type: "string" }),
            defineField({ name: "addToCartLabel", title: "Add to cart button", type: "string" }),
            defineField({ name: "purchaseSampleLabel", title: "Purchase sample button", type: "string" }),
            defineField({ name: "purchaseSampleHref", title: "Purchase sample link", type: "string" }),
            defineField({ name: "shippingText", title: "Shipping message", type: "string" }),
            defineField({ name: "specificationsHeading", title: "Specifications heading", type: "string" }),
            defineField({ name: "compositionLabel", title: "Composition label", type: "string" }),
            defineField({ name: "weightLabel", title: "Weight label", type: "string" }),
            defineField({ name: "widthLabel", title: "Width label", type: "string" }),
            defineField({ name: "careLabel", title: "Care label", type: "string" }),
          ],
          preview: { prepare: () => ({ title: "Product details settings", subtitle: "Labels, buttons, shipping and specifications" }) },
        }),
        defineArrayMember({
          name: "relatedProductsSettings",
          title: "Related products settings",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "productLimit", title: "Number of products", type: "number", initialValue: 4, validation: (rule) => rule.min(1).max(8).integer() }),
          ],
          preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Related products", subtitle: "Shopify recommendations" }) },
        }),
      ],
    }),
  ],
});
