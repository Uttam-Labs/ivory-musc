import { defineField, defineType } from "sanity";

export const headerSettings = defineType({
  name: "headerSettings",
  title: "Header",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Brand name", type: "string" }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({
      name: "logoSizeDesktop",
      title: "Logo size — desktop",
      description: "Figma base size 92 × 86px-এর percentage. Recommended: 100%.",
      type: "number",
      initialValue: 100,
      validation: (rule) => rule.min(50).max(220),
    }),
    defineField({
      name: "logoSizeMobile",
      title: "Logo size — mobile",
      description: "Figma base size 92 × 86px-এর percentage. Recommended: 90%.",
      type: "number",
      initialValue: 100,
      validation: (rule) => rule.min(50).max(200),
    }),
    defineField({ name: "navigation", title: "Navigation", type: "array", of: [{ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "href", type: "string" })] }] }),
    defineField({ name: "showSearch", title: "Show search icon", type: "boolean", initialValue: true }),
    defineField({ name: "searchHref", title: "Search icon link", type: "string", hidden: ({ document }) => !document?.showSearch }),
    defineField({ name: "showAccount", title: "Show account icon", type: "boolean", initialValue: true }),
    defineField({ name: "accountHref", title: "Account icon link", type: "string", hidden: ({ document }) => !document?.showAccount }),
    defineField({ name: "showCart", title: "Show cart icon", type: "boolean", initialValue: true }),
    defineField({ name: "cartHref", title: "Cart icon link", type: "string", hidden: ({ document }) => !document?.showCart }),
  ],
});
