import { defineArrayMember, defineField, defineType } from "sanity";

const imageField = () => defineField({
  name: "image",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
});

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Page title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3 }),
    defineField({
      name: "sections",
      title: "Page sections",
      type: "array",
      validation: (rule) => rule.max(2),
      of: [
        defineArrayMember({
          name: "contactHero",
          title: "Hero",
          type: "object",
          fields: [
            imageField(),
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "body", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "overlayOpacity", title: "Dark overlay (%)", type: "number", initialValue: 15, validation: (rule) => rule.min(0).max(100) }),
          ],
          preview: { select: { title: "heading", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Hero", subtitle: "Contact hero", media }) },
        }),
        defineArrayMember({
          name: "contactFormSection",
          title: "Contact form",
          type: "object",
          fields: [
            imageField(),
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "body", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "firstNameLabel", title: "First name label", type: "string" }),
            defineField({ name: "lastNameLabel", title: "Last name label", type: "string" }),
            defineField({ name: "emailLabel", title: "Email label", type: "string" }),
            defineField({ name: "phoneLabel", title: "Phone label", type: "string" }),
            defineField({ name: "messageLabel", title: "Message label", type: "string" }),
            defineField({ name: "submitLabel", title: "Submit button label", type: "string" }),
            defineField({ name: "successMessage", title: "Success message", type: "text", rows: 2 }),
            defineField({ name: "errorMessage", title: "Error message", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "heading", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Contact form", subtitle: "Image, copy, fields and messages", media }) },
        }),
      ],
    }),
  ],
});
