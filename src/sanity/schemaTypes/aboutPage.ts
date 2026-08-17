import { defineArrayMember, defineField, defineType } from "sanity";

const image = (name = "image", title = "Image") =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
  });
const item = {
  type: "object",
  fields: [
    image("icon", "Icon"),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "body", type: "text", rows: 4 }),
  ],
} as const;

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({
      name: "sections",
      title: "Page Sections",
      type: "array",
      of: [
        defineArrayMember({
          name: "aboutHero",
          title: "Hero",
          type: "object",
          fields: [
            image("image", "Background image"),
            defineField({ name: "heading", type: "string" }),
            defineField({ name: "body", type: "text", rows: 3 }),
            defineField({ name: "primaryLabel", type: "string" }),
            defineField({ name: "primaryHref", type: "string" }),
            defineField({ name: "secondaryLabel", type: "string" }),
            defineField({ name: "secondaryHref", type: "string" }),
          ],
          preview: {
            select: { title: "heading", media: "image" },
            prepare: ({ title, media }) => ({
              title: title || "Hero",
              subtitle: "Hero section",
              media,
            }),
          },
        }),
        defineArrayMember({
          name: "aboutEditorial",
          title: "Image + Text",
          type: "object",
          fields: [
            defineField({
              name: "sectionName",
              title: "Section label",
              type: "string",
            }),
            image(),
            defineField({
              name: "imagePosition",
              type: "string",
              options: { list: ["left", "right"] },
              initialValue: "left",
            }),
            defineField({ name: "heading", type: "string" }),
            defineField({ name: "body", type: "text", rows: 8 }),
            defineField({
              name: "items",
              title: "Icon blocks (optional)",
              description:
                "Nature section-এর নিচের benefit blocks এখানে থাকবে।",
              type: "array",
              of: [item],
            }),
          ],
          preview: {
            select: {
              title: "sectionName",
              subtitle: "heading",
              media: "image",
            },
          },
        }),
        defineArrayMember({
          name: "aboutFeatureGrid",
          title: "Feature Grid",
          type: "object",
          fields: [
            defineField({
              name: "sectionName",
              title: "Section label",
              type: "string",
            }),
            defineField({ name: "items", type: "array", of: [item] }),
          ],
          preview: {
            select: { title: "sectionName" },
            prepare: ({ title }) => ({
              title: title || "Feature Grid",
              subtitle: "Icon and text cards",
            }),
          },
        }),
        defineArrayMember({
          name: "aboutVision",
          title: "Vision",
          type: "object",
          fields: [
            defineField({ name: "heading", type: "string" }),
            defineField({ name: "body", type: "text", rows: 5 }),
            defineField({
              name: "cards",
              title: "Explore cards",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    image(),
                    defineField({ name: "title", type: "string" }),
                    defineField({ name: "body", type: "text", rows: 5 }),
                    defineField({ name: "linkLabel", type: "string" }),
                    defineField({ name: "linkHref", type: "string" }),
                  ],
                },
              ],
            }),
          ],
          preview: {
            select: { title: "heading" },
            prepare: ({ title }) => ({
              title: title || "Vision",
              subtitle: "Heading, introduction and explore cards",
            }),
          },
        }),
      ],
    }),
  ],
});
