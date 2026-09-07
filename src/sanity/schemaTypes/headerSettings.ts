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
    defineField({
      name: "navigation",
      title: "Navigation",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Menu label", type: "string" }),
          defineField({ name: "href", title: "Menu link", type: "string" }),
          defineField({
            name: "isVisible",
            title: "Show in navigation",
            description: "Turn this off to hide the menu item without deleting it.",
            type: "boolean",
            initialValue: true,
          }),
        ],
        preview: {
          select: { title: "label", href: "href", isVisible: "isVisible" },
          prepare: ({ title, href, isVisible }) => ({
            title: title || "Untitled menu item",
            subtitle: `${isVisible === false ? "Hidden" : "Visible"}${href ? ` · ${href}` : ""}`,
          }),
        },
      }],
    }),
    defineField({ name: "showSearch", title: "Show search icon", type: "boolean", initialValue: true }),
    defineField({ name: "searchHref", title: "Search icon link", type: "string", hidden: ({ document }) => !document?.showSearch }),
    defineField({ name: "showAccount", title: "Show account icon", type: "boolean", initialValue: true }),
    defineField({ name: "accountHref", title: "Account icon link", type: "string", hidden: ({ document }) => !document?.showAccount }),
    defineField({ name: "showCart", title: "Show cart icon", type: "boolean", initialValue: true }),
    defineField({ name: "cartHref", title: "Cart icon link", type: "string", hidden: ({ document }) => !document?.showCart }),
  ],
});
