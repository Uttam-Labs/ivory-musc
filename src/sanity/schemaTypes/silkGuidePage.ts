import { defineField, defineType } from "sanity";

const imageField = (name: string, title: string) => defineField({
  name,
  title,
  type: "image",
  options: { hotspot: true },
  fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
});

const textList = (name: string, title: string) => defineField({ name, title, type: "array", of: [{ type: "string" }] });

export const silkGuidePage = defineType({
  name: "silkGuidePage",
  title: "Silk guide page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", initialValue: "Silk Guide" }),
    defineField({ name: "seoTitle", title: "SEO title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3 }),
    defineField({ name: "hero", title: "Hero", type: "object", fields: [imageField("image", "Background image"), defineField({ name: "heading", type: "string" }), defineField({ name: "tagline", type: "string" })] }),
    defineField({ name: "introduction", title: "Introduction", type: "text", rows: 6 }),
    defineField({ name: "art", title: "The art of silk", type: "object", fields: [imageField("image", "Image"), defineField({ name: "eyebrow", type: "string" }), defineField({ name: "heading", type: "string" }), defineField({ name: "body", type: "text", rows: 8 })] }),
    defineField({ name: "understanding", title: "Understanding silk", type: "object", fields: [defineField({ name: "heading", type: "string" }), defineField({ name: "introduction", type: "text", rows: 3 }), imageField("image", "Image"), defineField({ name: "characteristics", type: "array", of: [{ type: "object", fields: [defineField({ name: "title", type: "string" }), defineField({ name: "body", type: "text", rows: 6 })], preview: { select: { title: "title" } } }] })] }),
    defineField({ name: "fabricsHeading", title: "Fabrics heading", type: "string" }),
    defineField({ name: "fabricsIntroduction", title: "Fabrics introduction", type: "text", rows: 3 }),
    defineField({ name: "fabrics", title: "Silk fabric library", type: "array", of: [{ type: "object", fields: [defineField({ name: "title", type: "string" }), defineField({ name: "tagline", type: "string" }), defineField({ name: "body", type: "text", rows: 5 }), defineField({ name: "character", type: "string" }), defineField({ name: "considerFor", title: "Consider for", type: "text", rows: 3 })], preview: { select: { title: "title", subtitle: "tagline" } } }] }),
    defineField({ name: "finder", title: "Find your silk", type: "object", fields: [defineField({ name: "heading", type: "string" }), defineField({ name: "introduction", type: "text", rows: 3 }), defineField({ name: "cards", type: "array", of: [{ type: "object", fields: [defineField({ name: "title", type: "string" }), defineField({ name: "body", type: "text", rows: 4 }), textList("fabrics", "Recommended fabrics")], preview: { select: { title: "title", subtitle: "body" } } }] })] }),
    imageField("guideImage", "Detailed guide image"),
    defineField({ name: "guideSections", title: "Detailed guide sections", type: "array", of: [{ type: "object", fields: [defineField({ name: "navigationLabel", title: "Navigation label", type: "string" }), defineField({ name: "heading", type: "string" }), defineField({ name: "body", type: "text", rows: 8 }), textList("bullets", "List items"), defineField({ name: "notes", title: "Feature notes", type: "array", of: [{ type: "object", fields: [defineField({ name: "eyebrow", type: "string" }), defineField({ name: "title", type: "string" }), defineField({ name: "body", type: "text", rows: 5 })], preview: { select: { title: "title", subtitle: "eyebrow" } } }] })], preview: { select: { title: "navigationLabel", subtitle: "heading" } } }] }),
    defineField({ name: "cta", title: "Bottom call to action", type: "object", fields: [defineField({ name: "eyebrow", type: "string" }), defineField({ name: "heading", type: "string" }), defineField({ name: "body", type: "text", rows: 3 }), defineField({ name: "buttonLabel", type: "string" }), defineField({ name: "buttonHref", type: "string" })] }),
  ],
});
