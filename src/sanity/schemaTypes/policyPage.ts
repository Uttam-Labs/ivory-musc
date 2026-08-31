import { defineArrayMember, defineField, defineType } from "sanity";

export const policyPage = defineType({
  name: "policyPage",
  title: "Policy page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "navigationLabel",
      title: "Navigation label",
      type: "string",
      description: "Short label used in the policy navigation.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Page URL",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "body",
      title: "Page content",
      type: "array",
      validation: (rule) => rule.required(),
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet list", value: "bullet" },
            { title: "Numbered list", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL or email link",
                    type: "string",
                    description: "Use mailto:email@example.com for an email link.",
                    validation: (rule) => rule.required(),
                  }),
                  defineField({
                    name: "openInNewTab",
                    title: "Open in a new tab",
                    type: "boolean",
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
