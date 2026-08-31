import { defineArrayMember, defineField, defineType } from "sanity";
import { ShopifyCollectionInput } from "../components/shopify-collection-input";

const linkFields = [defineField({ name: "buttonLabel", type: "string" }), defineField({ name: "buttonHref", type: "string" })];
const imageField = defineField({ name: "image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string" })] });

export const homePage = defineType({
  name: "homePage", title: "Home page", type: "document",
  fields: [
    defineField({ name: "title", type: "string", initialValue: "Home" }),
    defineField({ name: "sections", title: "Page sections", type: "array", of: [
      defineArrayMember({ name: "hero", title: "Hero banner", type: "object", fields: [
        defineField({ name: "heading", type: "string" }),
        defineField({ name: "body", type: "text" }),
        imageField,
        ...linkFields,
        defineField({ name: "secondaryButtonLabel", title: "Second button label", type: "string" }),
        defineField({ name: "secondaryButtonHref", title: "Second button link", type: "string" }),
        defineField({
          name: "mobileContent",
          title: "Mobile content",
          description: "Content shown only on mobile. Empty fields use the desktop hero content.",
          type: "object",
          options: { collapsible: true, collapsed: false },
          fields: [
            defineField({ name: "image", title: "Mobile banner image", type: "image", description: "Optional. Leave empty to use the desktop banner image.", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string" })] }),
            defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Exceptional Materials Matter Most" }),
            defineField({ name: "body", title: "Short text", type: "text", rows: 3, initialValue: "Thoughtfully curated silk fabrics, chosen for beauty, quality, and performance—made to bring your creative ideas to life." }),
            defineField({ name: "primaryButtonLabel", title: "First button label", type: "string", initialValue: "Shop" }),
            defineField({ name: "primaryButtonHref", title: "First button link", type: "string", initialValue: "/collections/shop" }),
            defineField({ name: "secondaryButtonLabel", title: "Second button label", type: "string", initialValue: "Discover Ivory Muse" }),
            defineField({ name: "secondaryButtonHref", title: "Second button link", type: "string", initialValue: "/about" }),
          ],
        }),
      ] }),
      defineArrayMember({ name: "imageText", title: "Image + text", type: "object", fields: [defineField({ name: "eyebrow", type: "string" }), defineField({ name: "heading", type: "string" }), defineField({ name: "body", type: "text" }), imageField, defineField({ name: "layout", title: "Layout", type: "string", options: { list: [{title:"Split image and text",value:"split"},{title:"Full-width image banner",value:"banner"}] }, initialValue: "split" }), defineField({ name: "imagePosition", type: "string", options: { list: ["left", "right"] }, initialValue: "left" }), ...linkFields] }),
      defineArrayMember({ name: "collectionSlider", title: "Shopify collection slider", type: "object", fields: [defineField({ name: "heading", type: "string" }), defineField({ name: "intro", type: "string" }), defineField({ name: "collectionHandle", title: "Shopify collection", description: "Products from the selected Shopify collection will appear in this slider.", type: "string", components: { input: ShopifyCollectionInput }, validation: rule => rule.required() }), defineField({ name: "autoSlide", title: "Auto slide", type: "boolean", initialValue: true }), defineField({ name: "slideInterval", title: "Slide interval (milliseconds)", description: "5000 means 5 seconds.", type: "number", initialValue: 5000, hidden: ({parent}) => !parent?.autoSlide, validation: rule => rule.min(1000).max(30000).integer() })] }),
      defineArrayMember({ name: "centeredStory", title: "Centered story", type: "object", fields: [defineField({ name: "heading", type: "string" }), defineField({ name: "body", type: "text" }), ...linkFields] }),
      defineArrayMember({ name: "featureGuide", title: "Feature guide", type: "object", fields: [defineField({ name: "heading", type: "string" }), defineField({ name: "body", type: "text" }), ...linkFields, defineField({ name: "features", type: "array", of: [defineArrayMember({ type: "object", fields: [defineField({ name: "title", type: "string" }), defineField({ name: "icon", type: "image" })] })] })] }),
      defineArrayMember({ name: "newsletter", title: "Newsletter", type: "object", fields: [defineField({ name: "heading", type: "string" }), defineField({ name: "body", type: "text" }), defineField({ name: "emailPlaceholder", type: "string" }), defineField({ name: "submitLabel", type: "string" }), imageField] }),
    ] }),
  ],
});
