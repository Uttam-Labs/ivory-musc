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
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Collection page" }),
  },
});
