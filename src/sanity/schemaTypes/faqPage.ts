import { defineArrayMember, defineField, defineType } from "sanity";

const imageField = defineField({
  name: "image",
  title: "Background image",
  type: "image",
  options: { hotspot: true },
  fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
});

export const faqPage = defineType({
  name: "faqPage",
  title: "FAQ page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Page title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3 }),
    defineField({
      name: "sections",
      title: "Page sections",
      type: "array",
      validation: (rule) => rule.max(3),
      of: [
        defineArrayMember({
          name: "faqHero",
          title: "Hero",
          type: "object",
          fields: [
            imageField,
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({
              name: "mobileHeading",
              title: "Mobile heading",
              description: "A shorter heading used on mobile. Falls back to the main heading when empty.",
              type: "string",
            }),
            defineField({ name: "body", title: "Description", type: "text", rows: 3 }),
            defineField({
              name: "overlayOpacity",
              title: "Dark overlay (%)",
              type: "number",
              initialValue: 18,
              validation: (rule) => rule.min(0).max(100),
            }),
          ],
          preview: { select: { title: "heading", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Hero", subtitle: "FAQ hero", media }) },
        }),
        defineArrayMember({
          name: "faqAccordion",
          title: "FAQ accordion",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Section heading", type: "string" }),
            defineField({
              name: "defaultOpenItem",
              title: "Initially open item",
              description: "1 opens the first question. Use 0 to keep all questions closed.",
              type: "number",
              initialValue: 1,
              validation: (rule) => rule.min(0).integer(),
            }),
            defineField({
              name: "items",
              title: "Questions and answers",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
                    defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (rule) => rule.required() }),
                  ],
                  preview: { select: { title: "question", subtitle: "answer" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "FAQ", subtitle: "Questions and answers" }) },
        }),
        defineArrayMember({
          name: "faqCta",
          title: "Bottom CTA",
          type: "object",
          fields: [
            imageField,
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "body", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
            defineField({ name: "buttonHref", title: "Button link", type: "string" }),
            defineField({
              name: "overlayOpacity",
              title: "Light overlay (%)",
              type: "number",
              initialValue: 25,
              validation: (rule) => rule.min(0).max(100),
            }),
          ],
          preview: { select: { title: "heading", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Bottom CTA", subtitle: "Image, text and button", media }) },
        }),
      ],
    }),
  ],
});
