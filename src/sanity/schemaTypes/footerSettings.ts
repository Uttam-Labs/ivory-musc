import { defineField, defineType } from "sanity";

export const footerSettings = defineType({
  name: "footerSettings",
  title: "Footer",
  type: "document",
  fields: [
    defineField({
      name: "footerColumns",
      title: "Link columns",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "heading", type: "string" }),
          defineField({
            name: "links",
            type: "array",
            of: [{
              type: "object",
              fields: [
                defineField({ name: "label", type: "string" }),
                defineField({ name: "href", type: "string" }),
              ],
            }],
          }),
        ],
      }],
    }),
    defineField({ name: "contactHeading", title: "Email column title", type: "string" }),
    defineField({ name: "contactEmail", title: "Contact email", type: "string" }),
    defineField({ name: "emailPrefix", title: "Email prefix", type: "string", initialValue: "Email" }),
    defineField({ name: "socialHeading", title: "Social column title", type: "string" }),
    defineField({ name: "facebookUrl", title: "Facebook URL", type: "url" }),
    defineField({ name: "facebookLabel", title: "Facebook accessibility label", type: "string", initialValue: "Facebook" }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url" }),
    defineField({ name: "instagramLabel", title: "Instagram accessibility label", type: "string", initialValue: "Instagram" }),
    defineField({
      name: "copyright",
      title: "Copyright text",
      description: "The website automatically updates the year in this text to the current year.",
      type: "string",
    }),
  ],
});
